import amqp from "amqplib";

let channel: amqp.Channel;

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const connectRabbitMQ = async () => {
  while (true) {
    try {
      const connection = await amqp.connect({
        protocol: "amqp",
        hostname: process.env.Rabbitmq_Host,
        port: 5672,
        username: process.env.Rabbitmq_Username,
        password: process.env.Rabbitmq_Password,
      });

      channel = await connection.createChannel();

      console.log("✅ Connected to RabbitMQ");
      break;
    } catch (error) {
      console.log("⏳ RabbitMQ not ready, retrying in 5 seconds...");
      await sleep(5000);
    }
  }
};

export const publishToQueue = async (queueName: string, message: any) => {
  if (!channel) {
    console.log("❌ RabbitMQ channel not initialized");
    return;
  }

  await channel.assertQueue(queueName, { durable: true });

  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });
};
