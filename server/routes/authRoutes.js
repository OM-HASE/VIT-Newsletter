const express = require("express");
const router = express.Router();

const {
  register,
  login,
  sendOtp,
  verifyOtp
} = require("../controllers/authController");

const rateLimit = require("express-rate-limit");

const otpLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 3, 
  message: {
    message: "Too many OTP requests, please try again later"
  }
});
router.post("/register", register);
router.post("/login", login);
router.post("/send-otp", otpLimiter, sendOtp);
router.post("/verify-otp", verifyOtp);


module.exports = router;