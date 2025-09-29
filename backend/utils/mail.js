// backend/utils/mail.js - COMPLETE REPLACEMENT WITH TLS FIX
import nodemailer from "nodemailer";

const { EMAIL, PASS } = process.env;

let transporter;

export async function getTransporter() {
  const { EMAIL, PASS, NODE_ENV } = process.env;
  if (!EMAIL || !PASS) throw new Error("Missing EMAIL or PASS");

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,          // STARTTLS
    auth: { user: EMAIL, pass: PASS },
    tls: {
      // allow self-signed certs only outside production
      rejectUnauthorized: NODE_ENV === "production" ? true : false,
    },
  });

  await transporter.verify();
  console.log("✅ Mail transporter ready");
  return transporter;
}

export const sendOtpMail = async (to, subject, text, html) => {
  const tx = await getTransporter();
  const from = EMAIL;
  try {
    const info = await tx.sendMail({
      from,
      to,
      subject: subject || "Your OTP",
      text: text || "Your OTP code.",
      html: html || `<p>Your OTP code.</p>`,
      replyTo: from,
    });
    console.log("📧 OTP sent:", info?.messageId || info?.response);
    return info;
  } catch (error) {
    console.error("❌ sendOtpMail error:", error?.message, error?.code, error?.response);
    throw error;
  }
};

export default sendOtpMail;
