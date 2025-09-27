import nodemailer from "nodemailer";

const { EMAIL, PASS, FROM_EMAIL, GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN } = process.env;
const useOAuth2 = Boolean(GMAIL_CLIENT_ID && GMAIL_CLIENT_SECRET && GMAIL_REFRESH_TOKEN);

let transporter;

async function getTransporter() {
  if (transporter) return transporter;

  if (useOAuth2) {
   transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: EMAIL, pass: PASS },
  connectionTimeout: 20000,
  greetingTimeout: 15000,
  socketTimeout: 30000,
  family: 4,
});

  } else {
    // Primary: SMTPS 465 (TLS)
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: EMAIL, pass: PASS },
      tls: { minVersion: "TLSv1.2" },
      connectionTimeout: 20000,
      greetingTimeout: 15000,
      socketTimeout: 30000,
      family: 4, // prefer IPv4 to avoid IPv6 routing issues
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
