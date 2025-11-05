import axios from "axios";
import pkg from "youtube-transcript";
import { getSubtitles } from "youtube-captions-scraper";
const { getTranscript } = pkg;

// Timeout utility
const withTimeout = (promise, ms = 5000) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms)),
  ]);

/**
 * Fetch YouTube transcript or captions with multi-layer fallback
 */
export const getYouTubeTranscript = async (videoUrl) => {
  try {
    const videoId =
      videoUrl.split("v=")[1]?.split("&")[0] || videoUrl.split("/").pop();
    console.log("🎞 Extracted Video ID:", videoId);

    // 1️⃣ Try youtube-transcript
    try {
      const transcript = await withTimeout(getTranscript(videoId), 5000);
      if (transcript?.length) {
        console.log("✅ Transcript via youtube-transcript");
        return transcript.map((t) => t.text).join(" ");
      }
    } catch (err) {
      console.warn("⚠️ youtube-transcript failed:", err.message);
    }

    // 2️⃣ Try youtube-captions-scraper
    try {
      const captions = await withTimeout(getSubtitles({ videoID: videoId, lang: "en" }), 5000);
      if (captions?.length) {
        console.log("✅ Captions via youtube-captions-scraper");
        return captions.map((c) => c.text).join(" ");
      }
    } catch (err) {
      console.warn("⚠️ Captions API failed:", err.message);
    }

    // 3️⃣ Fallback to youtubetranscript.com
    try {
      const { data } = await withTimeout(
        axios.get(`https://youtubetranscript.com/?server_vid2=${videoId}`),
        5000
      );

      if (
        data &&
        typeof data === "string" &&
        !data.includes("No captions found") &&
        !data.includes("<!DOCTYPE html>")
      ) {
        console.log("✅ Fallback fetched from youtubetranscript.com");
        const text = data.replace(/<[^>]*>/g, " ").trim();
        return text;
      }
    } catch (err) {
      console.warn("⚠️ Fallback failed:", err.message);
    }

    return null;
  } catch (error) {
    console.error("❌ Error fetching transcript:", error.message);
    return null;
  }
};
