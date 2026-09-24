const nodemailer = require("nodemailer");
const env = require("../config/env");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const { host, port, secure, user, pass } = env.smtp;
  const cleanPass = (pass || "").replace(/\s+/g, "");

  let transportConfig;
  if (host === "smtp.gmail.com" || (user && user.toLowerCase().endsWith("@gmail.com"))) {
    transportConfig = {
      pool: true,
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      family: 4,
      auth: {
        user,
        pass: cleanPass
      },
      maxConnections: 5,
      maxMessages: 100
    };
  } else {
    transportConfig = {
      pool: true,
      host: host || "smtp.gmail.com",
      port: port || 587,
      secure: Boolean(secure),
      family: 4,
      maxConnections: 5
    };
    if (user && pass) {
      transportConfig.auth = { user, pass: cleanPass };
    }
  }

  transporter = nodemailer.createTransport(transportConfig);
  return transporter;
}

/**
 * Sends a 6-digit OTP to the recipient email address for password reset.
 * @param {string} email
 * @param {string} otp
 * @returns {Promise<{success: boolean, messageId?: string, simulated?: boolean, error?: string}>}
 */
async function sendPasswordResetOtp(email, otp) {
  const { user, pass, from } = env.smtp;

  const subject = `${otp} is your ZMW Clothing verification code`;
  const text = `Hello,\n\nYour password reset verification code is: ${otp}\n\nThis OTP is valid for 10 minutes. If you did not request this, please ignore this email.\n\nBest regards,\nZMW Clothing Team`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ZMW Clothing - Password Reset Code</title>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #f7f7f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937;">
  <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    <div style="background-color: #111827; padding: 28px 24px; text-align: center;">
      <span style="font-size: 13px; font-weight: 700; letter-spacing: 3px; color: #d4af37; text-transform: uppercase;">ZMW CLOTHING</span>
      <h1 style="color: #ffffff; font-size: 20px; font-weight: 600; margin: 10px 0 0 0; letter-spacing: 0.5px;">Password Reset Verification</h1>
    </div>
    <div style="padding: 32px 28px;">
      <p style="font-size: 15px; line-height: 1.6; color: #374151; margin: 0 0 18px 0;">
        Hello,
      </p>
      <p style="font-size: 15px; line-height: 1.6; color: #374151; margin: 0 0 24px 0;">
        We received a request to reset your <strong>ZMW Clothing</strong> account password. Use the verification code below to complete your password reset:
      </p>
      
      <div style="background: #f3f4f6; border: 2px dashed #d1d5db; border-radius: 10px; padding: 22px; text-align: center; margin: 24px 0;">
        <span style="display: block; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: #6b7280; margin-bottom: 8px;">Your 6-Digit One-Time Code</span>
        <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #111827; display: inline-block;">${otp}</span>
      </div>

      <div style="background: #fefce8; border-left: 4px solid #eab308; padding: 12px 16px; border-radius: 4px; margin-bottom: 24px;">
        <p style="margin: 0; font-size: 13px; color: #854d0e; line-height: 1.5;">
          ⏱️ <strong>Important:</strong> This verification code is valid for <strong>10 minutes</strong> and can only be used once.
        </p>
      </div>

      <p style="font-size: 13px; line-height: 1.5; color: #6b7280; margin: 0 0 8px 0;">
        If you did not request a password reset, no further action is required. Your password will remain unchanged.
      </p>
    </div>

    <div style="background: #f9fafb; border-top: 1px solid #f3f4f6; padding: 18px 24px; text-align: center;">
      <p style="font-size: 12px; color: #9ca3af; margin: 0;">
        &copy; ${new Date().getFullYear()} ZMW Clothing. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  // Always log prominently to terminal console
  console.log("\n=======================================================");
  console.log(`[ZMW NODEMAILER] 🔑 PASSWORD RESET OTP DISPATCHED`);
  console.log(`[Recipient] : ${email}`);
  console.log(`[OTP Code]  : ${otp}`);
  console.log(`[Expires In]: 10 minutes`);
  console.log("=======================================================\n");

  if (!user || !pass) {
    console.log(`[ZMW NODEMAILER] ℹ️ SMTP_USER / SMTP_PASS not set in Backend/.env.`);
    console.log(`[ZMW NODEMAILER] 💡 To send real emails, set SMTP_USER and SMTP_PASS (e.g. Gmail App Password) in Backend/.env.`);
    return { success: true, simulated: true };
  }

  try {
    const transport = getTransporter();
    const info = await transport.sendMail({
      from: from || `ZMW Clothing <${user}>`,
      to: email,
      subject,
      text,
      html
    });

    console.log(`[ZMW NODEMAILER] ✅ Real email sent successfully to ${email}. (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[ZMW NODEMAILER] ❌ Failed to dispatch email via SMTP:`, err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  getTransporter,
  sendPasswordResetOtp
};
