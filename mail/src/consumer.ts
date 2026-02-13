import amqp from "amqplib";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const QUEUE = "send-otp";

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const startSendOtpConsumer = async () => {
  while (true) {
    try {
      console.log("⏳ Waiting for RabbitMQ...");

      const connection = await amqp.connect({
        protocol: "amqp",
        hostname: process.env.Rabbitmq_Host,
        port: Number(process.env.Rabbitmq_Port),
        username: process.env.Rabbitmq_Username,
        password: process.env.Rabbitmq_Password,
      });

      const channel = await connection.createChannel();

      await channel.assertQueue(QUEUE, { durable: true });

      console.log("✅ RabbitMQ connected (MAIL)");
      console.log("📨 Listening for OTP emails...");

      channel.consume(QUEUE, async (msg) => {
        if (!msg) return;

        try {
          const { to, subject, body } = JSON.parse(
            msg.content.toString()
          );

          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.USER,
              pass: process.env.PASS,
            },
          });

          await transporter.sendMail({
            from: `"Chat App" <${process.env.USER}>`,
            to,
            subject,
            text: body,
          });

          console.log("✅ OTP mail sent");
          channel.ack(msg);
        } catch (err) {
          console.error("❌ Mail send failed", err);
        }
      });

      return; // 👈 IMPORTANT — STOP LOOP AFTER SUCCESS
    } catch (err) {
      console.log("❌ RabbitMQ not ready — retrying in 5s");
      await sleep(5000);
    }
  }
};
