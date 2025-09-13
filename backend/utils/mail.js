// utils/mail.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const sendOtpMail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL,
      to,
      subject: subject || "Your OTP for Password Reset",
      text: text || `Your OTP code.`,
      html: html || `<p>${text || "Your OTP code."}</p>`,
    });
    console.log("Mail sent:", info.response);
    return info;
  } catch (error) {
    console.error("Error sending mail:", error);
    throw error;
  }
};

export default sendOtpMail;
