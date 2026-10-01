const Razorpay = require("razorpay");
const crypto = require("crypto");
const env = require("../config/env");

let instance = null;

function getRazorpayInstance() {
  if (!instance) {
    if (!env.razorpay.keyId || !env.razorpay.keySecret) {
      throw new Error("Razorpay credentials are not configured in backend environment.");
    }
    instance = new Razorpay({
      key_id: env.razorpay.keyId,
      key_secret: env.razorpay.keySecret
    });
  }
  return instance;
}

async function createOrder({ amountInPaise, currency = "INR", receipt, notes = {} }) {
  const rzp = getRazorpayInstance();
  return rzp.orders.create({
    amount: amountInPaise,
    currency,
    receipt,
    notes
  });
}

function verifySignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return false;
  }
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", env.razorpay.keySecret)
    .update(body.toString())
    .digest("hex");
  return expectedSignature === razorpaySignature;
}

module.exports = {
  getRazorpayInstance,
  createOrder,
  verifySignature,
  getKeyId: () => env.razorpay.keyId
};
