import express from "express";
import { addVideo, getVideos,searchVideos } from "../controllers/videoController.js";
import { protect } from "../middleware/authMiddleware.js";


const router = express.Router();
router.post("/", protect, addVideo);
router.get("/", getVideos);
router.get("/search/:query", searchVideos);

export default router;
