const crypto = require("crypto");

// In-memory store: Map<email, { otpHash, expiresAt, attempts }>
const store = new Map();

function hashOtp(email, otp) {
  return crypto
    .createHash("sha256")
    .update(`${email.toLowerCase().trim()}:${otp.toString().trim()}`)
    .digest("hex");
}

/**
 * Saves a 6-digit OTP for the given email with a TTL (default: 10 minutes).
 * @param {string} email
 * @param {string} otp
 * @param {number} ttlMinutes
 */
function saveOtp(email, otp, ttlMinutes = 10) {
  const normalizedEmail = email.toLowerCase().trim();
  const expiresAt = Date.now() + ttlMinutes * 60 * 1000;
  const otpHash = hashOtp(normalizedEmail, otp);

  store.set(normalizedEmail, {
    otpHash,
    expiresAt,
    attempts: 0
  });

  return { expiresAt };
}

/**
 * Verifies the 6-digit OTP for the given email.
 * @param {string} email
 * @param {string} otp
 * @returns {{valid: boolean, reason?: string}}
 */
function verifyOtp(email, otp) {
  if (!email || !otp) {
    return { valid: false, reason: "Email and 6-digit OTP are required." };
  }

  const normalizedEmail = email.toLowerCase().trim();
  const record = store.get(normalizedEmail);

  if (!record) {
    return { valid: false, reason: "No active verification code found for this email, or code expired. Please request a new OTP." };
  }

  if (Date.now() > record.expiresAt) {
    store.delete(normalizedEmail);
    return { valid: false, reason: "This OTP code has expired. Please request a new code." };
  }

  if (record.attempts >= 5) {
    store.delete(normalizedEmail);
    return { valid: false, reason: "Too many failed attempts. Please request a new verification code." };
  }

  const inputHash = hashOtp(normalizedEmail, otp);
  if (inputHash !== record.otpHash) {
    record.attempts += 1;
    const remaining = 5 - record.attempts;
    return {
      valid: false,
      reason: `Invalid OTP code. Please check and try again. (${remaining} attempts remaining)`
    };
  }

  // Code is verified! Remove from store to guarantee single-use.
  store.delete(normalizedEmail);
  return { valid: true };
}

/**
 * Manually removes an OTP for a given email.
 * @param {string} email
 */
function clearOtp(email) {
  store.delete(email.toLowerCase().trim());
}

module.exports = {
  saveOtp,
  verifyOtp,
  clearOtp
};
