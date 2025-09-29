// testmail.js
import dotenv from "dotenv";
dotenv.config(); // Load .env before anything else

console.log("EMAIL:", process.env.EMAIL);
console.log("PASS set:", Boolean(process.env.PASS));

import { sendOtpMail } from "./utils/mail.js";

(async () => {
  try {
    await sendOtpMail(
      process.env.EMAIL,
      "Test Mail",
      "This is a test email",
      "<b>This is a test email</b>"
    );
    console.log("✅ Test mail sent successfully");
  } catch (err) {
    console.error("❌ Test mail error:", err);
  }
})();
