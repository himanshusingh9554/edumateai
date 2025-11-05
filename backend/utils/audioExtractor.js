import { exec } from "child_process";
import path from "path";
import fs from "fs";
import os from "os";

export const extractAudioFromVideo = async (videoUrl) => {
  try {
    const videoId =
      videoUrl.split("v=")[1]?.split("&")[0] || videoUrl.split("/").pop();
    const outputPath = path.resolve(`./temp_audio_${videoId}.mp3`);

    console.log("🎧 Extracting audio using yt-dlp + ffmpeg...");

    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

    const cmd =
      os.platform() === "win32"
        ? `yt-dlp -x --audio-format mp3 -o "${outputPath}" "${videoUrl}"`
        : `yt-dlp -x --audio-format mp3 --ffmpeg-location "$(which ffmpeg)" -o "${outputPath}" "${videoUrl}"`;

    await new Promise((resolve, reject) => {
      exec(cmd, { timeout: 180000 }, (error, stdout, stderr) => {
        if (error) {
          console.error("❌ yt-dlp error:", stderr || error.message);
          return reject(error);
        }

        if (!fs.existsSync(outputPath))
          return reject(new Error("Audio extraction failed"));

        console.log("✅ Audio extracted successfully:", outputPath);
        resolve();
      });
    });

    return outputPath;
  } catch (error) {
    console.error("❌ Audio extraction error:", error.message);
    return null;
  }
};
