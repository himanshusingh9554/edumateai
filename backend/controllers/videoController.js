import Video from "../models/Video.js";
import { searchYouTubeVideos } from "../utils/youtubeSearch.js";
import ytsr from 'ytsr'
export const addVideo = async (req, res) => {
  try {
    const { url, title, transcript } = req.body;
    const video = await Video.create({
      url,
      title,
      transcript,
      createdBy: req.user?.id || null,
    });
    res.status(201).json(video);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getVideos = async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const searchVideos = async (req, res) => {
  try {
    const { query } = req.params;
    const page = parseInt(req.query.page) || 1;
    const resultsPerPage = 10;

    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    console.log(`🔍 Searching YouTube for: ${query} (Page ${page})`);

    const searchResults = await ytsr(query, { limit: 50 * page });

    const videos = searchResults.items
      .filter(
        (v) =>
          v.type === "video" &&
          v.duration &&
          !v.title.toLowerCase().includes("shorts") &&
          parseDurationToSeconds(v.duration) > 90
      )
      .map((v) => ({
        videoId: v.id,
        title: v.title,
        thumbnail: v.bestThumbnail?.url || "",
        duration: v.duration,
        views: v.views,
        channel: v.author?.name || "Unknown Channel",
      }));

    const startIndex = (page - 1) * resultsPerPage;
    const paginated = videos.slice(startIndex, startIndex + resultsPerPage);
    const nextPage = videos.length > startIndex + resultsPerPage ? page + 1 : null;

    return res.json({ results: paginated, nextPage });
  } catch (error) {
    console.error("❌ YouTube search failed:", error.message);
    return res
      .status(500)
      .json({ error: "YouTube search failed — please try again later." });
  }
};

function parseDurationToSeconds(duration) {
  if (!duration) return 0;
  const parts = duration.split(":").map(Number).reverse();
  return parts.reduce((acc, val, i) => acc + val * Math.pow(60, i), 0);
}
