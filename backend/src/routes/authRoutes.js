import express from "express";
import {
  changePassword,
  changeVerificationPhone,
  deleteProfileDocument,
  forgotPassword,
  getMe,
  googleAuth,
  login,
  register,
  resendEmailOtp,
  resendMobileOtp,
  resetPassword,
  sendLoginOtp,
  updateProfile,
  uploadProfileDocuments,
  verifyEmailOtp,
  verifyLoginOtp,
  verifyMobileOtp,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  profileUpload,
  profilePhotoUpload,
  registerUpload,
} from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/register", registerUpload, register);
router.post("/login", login);
router.post("/send-login-otp", sendLoginOtp);
router.post("/verify-login-otp", verifyLoginOtp);
router.post("/google", googleAuth);
router.post("/verify-email-otp", verifyEmailOtp);
router.post("/verify-mobile-otp", verifyMobileOtp);
router.post("/resend-email-otp", resendEmailOtp);
router.post("/resend-mobile-otp", resendMobileOtp);
router.post("/change-verification-phone", changeVerificationPhone);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Protected user routes
router.get("/me", protect, getMe);
router.put("/change-password", protect, changePassword);
router.put("/profile", protect, profileUpload, updateProfile);
router.post("/profile/documents", protect, profileUpload, uploadProfileDocuments);
router.delete("/profile/documents/:index", protect, deleteProfileDocument);

export default router;
