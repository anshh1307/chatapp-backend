import dotenv from "dotenv";
import { startSendOtpConsumer } from "./consumer.js";

dotenv.config();

(async () => {
  await startSendOtpConsumer();
  console.log("📬 Mail worker started");
})();
