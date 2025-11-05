import express from "express";
import rateLimit from "express-rate-limit";
import {
  signup,
  login,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  deleteProfilePhoto,
  requestPasswordOtp,
  verifyPasswordOtp,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// OTP rate limiter
const otpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: "Too many OTP requests. Please wait a minute.",
});

// 🔹 Auth routes
router.post("/register", otpLimiter, signup);
router.post("/verify-otp", otpLimiter, verifyOtp);
router.post("/resend-otp", otpLimiter, resendOtp);
router.post("/login", login);
router.post("/forgot-password", otpLimiter, forgotPassword);
router.post("/reset-password", otpLimiter, resetPassword);
router.post("/logout", logout);

// 🔹 Profile
router.get("/me", protect, getProfile);
router.put("/update", protect, updateProfile);
router.delete("/delete-photo", protect, deleteProfilePhoto);
router.put("/change-password", protect, changePassword);

// 🔹 OTP-based password change (from Profile)
router.post("/request-password-otp", protect, otpLimiter, requestPasswordOtp);
router.post("/verify-password-otp", protect, verifyPasswordOtp);

export default router;
