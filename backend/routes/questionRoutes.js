import express from "express";
import {
  askQuestion,
  getQuestionsByVideo,
  getUserHistory
} from "../controllers/questionController.js";
import { protect } from "../middleware/authMiddleware.js";
// import { rateLimiter } from "../middleware/rateLimiter.js"; // Remove unused if askQuestionLimiter is preferred
import { askQuestionLimiter } from "../middleware/rateLimit.js";

const router = express.Router();

router.post("/ask", protect, askQuestionLimiter, askQuestion);

router.get("/video/:videoId", getQuestionsByVideo);
router.get("/user/:userId", protect, getUserHistory);

export default router;