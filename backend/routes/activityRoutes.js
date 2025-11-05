import express from "express";
import { getUserHistory } from "../controllers/activityController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getUserHistory);

export default router;
