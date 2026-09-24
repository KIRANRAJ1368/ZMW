const { body } = require("express-validator");

const login = [
  body("email").isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required")
];

const customerRegister = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 150 }),
  body("email").isEmail().withMessage("A valid email address is required").normalizeEmail(),
  body("phone").trim().notEmpty().withMessage("Mobile number is required").isLength({ min: 7, max: 20 }).withMessage("Please enter a valid mobile number"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("confirmPassword").optional().custom((val, { req }) => {
    if (val && val !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  })
];

const customerLogin = [
  body("email").isEmail().withMessage("A valid email address is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required")
];

const customerForgotPassword = [
  body("email").isEmail().withMessage("A valid email address is required").normalizeEmail()
];

const customerVerifyOtp = [
  body("email").isEmail().withMessage("A valid email address is required").normalizeEmail(),
  body("otp").trim().matches(/^\d{6}$/).withMessage("Please enter a valid 6-digit numeric OTP code.")
];

const customerResetPassword = [
  body().custom((val, { req }) => {
    const hasOtp = req.body.email && req.body.otp;
    const hasToken = Boolean(req.body.token);

    if (!hasOtp && !hasToken) {
      throw new Error("Reset token or verification OTP is required.");
    }
    return true;
  }),
  body("newPassword").custom((val, { req }) => {
    const pw = val || req.body.password;
    if (!pw || pw.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }
    return true;
  }),
  body("confirmPassword").optional().custom((val, { req }) => {
    const pw = req.body.newPassword || req.body.password;
    if (val && val !== pw) {
      throw new Error("Passwords do not match");
    }
    return true;
  })
];

module.exports = {
  login,
  customerRegister,
  customerLogin,
  customerForgotPassword,
  customerVerifyOtp,
  customerResetPassword
};
