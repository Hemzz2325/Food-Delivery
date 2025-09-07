// run: node testmail.js
import { sendOtpMail } from "./utils/mail.js";
import dotenv from "dotenv";
dotenv.config();

(async () => {
  try {
    await sendOtpMail(process.env.EMAIL, "Test Mail", "This is a test", "<b>test</b>");
    console.log("test mail OK");
  } catch (err) {
    console.error("test mail error", err);
  }
})();