import rateLimit from "express-rate-limit";

// 🔹 Allow 10 Gemini calls per user every 5 minutes
export const askQuestionLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // limit each user to 10 requests
  message: {
    error: "Too many requests. Please wait before asking more questions.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
