import express from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
import { updateTheme, getTheme } from "../controllers/userController.js";
import { updateProfile, changePassword, deleteProfilePhoto } from "../controllers/authController.js";

const router = express.Router();

// Multer setup for profile photo upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// 🔹 Theme routes
router.route("/theme")
  .get(protect, getTheme)
  .post(protect, updateTheme);

// 🔹 Profile routes (redundant with auth but kept for REST design)
router.put("/update", protect, upload.single("profilePhoto"), updateProfile);
router.delete("/delete-photo", protect, deleteProfilePhoto);
router.put("/change-password", protect, changePassword);

export default router;
