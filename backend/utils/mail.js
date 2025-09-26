// utils/mail.js
import nodemailer from "nodemailer";

const {
  EMAIL,                 // sender Gmail address
  PASS,                  // 16-char Gmail App Password
  FROM_EMAIL,            // optional; defaults to EMAIL
  GMAIL_CLIENT_ID,       // optional if you later switch to OAuth2
  GMAIL_CLIENT_SECRET,
  GMAIL_REFRESH_TOKEN,
} = process.env;

const useOAuth2 = Boolean(GMAIL_CLIENT_ID && GMAIL_CLIENT_SECRET && GMAIL_REFRESH_TOKEN);

let transporter;

async function getTransporter() {
  if (transporter) return transporter;

  if (useOAuth2) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: EMAIL,
        clientId: GMAIL_CLIENT_ID,
        clientSecret: GMAIL_CLIENT_SECRET,
        refreshToken: GMAIL_REFRESH_TOKEN,
      },
    });
  } else {
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // STARTTLS
      auth: { user: EMAIL, pass: PASS },
    });
  }

  try {
    await transporter.verify();
    console.log("✅ Mail transporter ready");
  } catch (e) {
    console.error("❌ Mail verify failed:", e?.message, e?.code, e?.response);
  }
  return transporter;
}

export const sendOtpMail = async (to, subject, text, html) => {
  const tx = await getTransporter();
  const from = FROM_EMAIL || EMAIL;

  try {
    const info = await tx.sendMail({
      from,               // keep equal to the authenticated Gmail address
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
