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

async function sendOrderConfirmationEmail(email, order) {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;

  const orderNumber = order.order_number || `#${order.id}`;
  const customerName = order.customer_name || "Valued Client";
  const items = order.items || [];
  const total = Number(order.total || 0).toLocaleString("en-IN");
  const subtotal = Number(order.subtotal || order.total || 0).toLocaleString("en-IN");
  const discount = Number(order.discount_amount || 0);
  const shipping = Number(order.shipping_fee || 0);

  const subject = `Order Confirmed: ${orderNumber} — ZMW Clothing Concierge`;
  const text = `Dear ${customerName},\n\nThank you for choosing ZMW Clothing. Your order ${orderNumber} for ₹${total} has been confirmed.\n\nShipping Address: ${order.shipping_address}, ${order.city || ""}\n\nWe will notify you once dispatched.\n\nZMW Clothing Atelier`;

  const itemsHtml = items.map((it) => {
    const title = it.product_name_snapshot || it.title || "Signature Piece";
    const qty = it.quantity || 1;
    const price = Number(it.unit_price || it.price || 0).toLocaleString("en-IN");
    const meta = [it.size ? `Size: ${it.size}` : "", it.color ? `Color: ${it.color}` : ""].filter(Boolean).join(" | ");
    return `
      <tr>
        <td style="padding: 10px 8px; border-bottom: 1px solid #eeeeee; font-size: 13px; color: #111827;">
          <strong>${title}</strong>
          ${meta ? `<div style="font-size: 11px; color: #6b7280; margin-top: 2px;">${meta}</div>` : ""}
        </td>
        <td style="padding: 10px 8px; border-bottom: 1px solid #eeeeee; font-size: 13px; color: #4b5563; text-align: center;">${qty}</td>
        <td style="padding: 10px 8px; border-bottom: 1px solid #eeeeee; font-size: 13px; color: #111827; text-align: right;">₹${price}</td>
      </tr>
    `;
  }).join("");

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Order Confirmation - ZMW Clothing</title>
</head>
<body style="margin: 0; padding: 24px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8f6f0; color: #111827;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
    <div style="background: #111111; padding: 28px 24px; text-align: center;">
      <h1 style="color: #c5a059; font-size: 26px; letter-spacing: 0.18em; margin: 0; font-weight: 700;">ZMW</h1>
      <p style="color: #d1d5db; font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; margin: 6px 0 0 0;">Haute Couture & Luxury Apparel</p>
    </div>

    <div style="padding: 32px 28px;">
      <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.15em; color: #c5a059; text-transform: uppercase;">Order Confirmed</span>
      <h2 style="font-size: 20px; color: #111827; margin: 6px 0 16px 0;">Thank you, ${customerName}</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
        We have received your order <strong>${orderNumber}</strong>. Our atelier artisans are hand-inspecting and preparing your pieces for express dispatch.
      </p>

      <div style="background: #fdfcf9; border: 1px solid #efe9dc; border-radius: 6px; padding: 16px; margin-bottom: 24px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="color: #6b7280; padding: 3px 0;">Order Reference:</td>
            <td style="text-align: right; font-weight: 600; color: #111827;">${orderNumber}</td>
          </tr>
          <tr>
            <td style="color: #6b7280; padding: 3px 0;">Payment Method:</td>
            <td style="text-align: right; font-weight: 600; color: #111827;">${(order.payment_method || "Online Pay").toUpperCase()}</td>
          </tr>
          <tr>
            <td style="color: #6b7280; padding: 3px 0;">Delivery Destination:</td>
            <td style="text-align: right; color: #111827;">${order.shipping_address}${order.city ? `, ${order.city}` : ""}</td>
          </tr>
        </table>
      </div>

      <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.08em; color: #111827; margin: 0 0 10px 0; border-bottom: 2px solid #111111; padding-bottom: 6px;">
        Ordered Items
      </h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background: #f9fafb;">
            <th style="padding: 8px; text-align: left; font-size: 11px; color: #6b7280; text-transform: uppercase;">Piece</th>
            <th style="padding: 8px; text-align: center; font-size: 11px; color: #6b7280; text-transform: uppercase;">Qty</th>
            <th style="padding: 8px; text-align: right; font-size: 11px; color: #6b7280; text-transform: uppercase;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml || '<tr><td colspan="3" style="padding: 12px; text-align: center; color: #6b7280;">Standard Luxury Order</td></tr>'}
        </tbody>
      </table>

      <div style="border-top: 1px solid #e5e7eb; padding-top: 12px; margin-bottom: 24px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 3px 0; color: #6b7280;">Subtotal:</td>
            <td style="padding: 3px 0; text-align: right; color: #111827;">₹${subtotal}</td>
          </tr>
          ${discount > 0 ? `
          <tr>
            <td style="padding: 3px 0; color: #2e7d32;">Privilege Discount:</td>
            <td style="padding: 3px 0; text-align: right; color: #2e7d32;">-₹${discount.toLocaleString("en-IN")}</td>
          </tr>` : ""}
          <tr>
            <td style="padding: 3px 0; color: #6b7280;">Express Insured Courier:</td>
            <td style="padding: 3px 0; text-align: right; color: #111827;">${shipping > 0 ? `₹${shipping.toLocaleString("en-IN")}` : "COMPLIMENTARY"}</td>
          </tr>
          <tr style="font-size: 16px; font-weight: 700; border-top: 1px solid #111111;">
            <td style="padding: 10px 0 0 0; color: #111827;">Total Paid:</td>
            <td style="padding: 10px 0 0 0; text-align: right; color: #c5a059;">₹${total}</td>
          </tr>
        </table>
      </div>

      <div style="background: #f9fafb; border-radius: 6px; padding: 14px; text-align: center; font-size: 12px; color: #6b7280;">
        Questions or special tailoring instructions? Reach our concierge at <a href="mailto:zmw@gmail.com" style="color: #c5a059; text-decoration: none; font-weight: 600;">zmw@gmail.com</a> or WhatsApp <strong>+91 9876543210</strong>.
      </div>
    </div>

    <div style="background: #111111; padding: 16px; text-align: center; font-size: 11px; color: #9ca3af;">
      &copy; ${new Date().getFullYear()} ZMW Clothing Atelier, 123 Avinashi Road, Coimbatore. All rights reserved.
    </div>
  </div>
</body>
</html>
  `;

  console.log(`\n[ZMW NODEMAILER] 📦 ORDER CONFIRMATION EMAIL PREPARED for ${email} (Order ${orderNumber})`);

  if (!user || !pass) {
    console.log(`[ZMW NODEMAILER] ℹ️ SMTP credentials not configured. Email simulated.`);
    return { success: true, simulated: true };
  }

  try {
    const transport = getTransporter();
    const info = await transport.sendMail({
      from: from || `ZMW Clothing Concierge <${user}>`,
      to: email,
      subject,
      text,
      html
    });
    console.log(`[ZMW NODEMAILER] ✅ Order confirmation dispatched to ${email}. (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[ZMW NODEMAILER] ❌ Failed to dispatch order confirmation:`, err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  getTransporter,
  sendPasswordResetOtp,
  sendOrderConfirmationEmail
};

