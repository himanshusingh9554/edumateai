import Question from "../models/Question.js";
import Video from "../models/Video.js";
import { getVideoMetadata } from "../utils/videoInfo.js";
import { getYouTubeTranscript } from "../utils/transcriptParser.js";
import { extractAudioFromVideo } from "../utils/audioExtractor.js";
import { convertAudioToText } from "../utils/speechToText.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Activity from "../models/Activity.js";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const askQuestion = async (req, res) => {
  try {
    const { question, videoUrl } = req.body;
    if (!question || !videoUrl)
      return res.status(400).json({ error: "Question and video URL are required." });

    console.log("🎬 Checking transcript for:", videoUrl);
    const videoId = videoUrl.split("v=")[1]?.split("&")[0] || videoUrl.split("/").pop();

    let videoDoc = await Video.findOne({ url: videoUrl });
    let transcript = videoDoc?.transcript || null;
    let context = "";
    let usedTranscript = false;

    const cachedQuestion = await Question.findOne({ video: videoDoc?._id, question });
    if (cachedQuestion) {
      console.log("⚡ Cached answer found.");
      return res.json({ question, answer: cachedQuestion.answer, cached: true });
    }

    if (!transcript) {
      transcript = await getYouTubeTranscript(videoUrl);
      if (transcript && transcript !== "Transcript not found") {
        usedTranscript = true;
        context = `Transcript snippet:\n${transcript.slice(0, 3000)}...`;
      } else {
        console.warn("⚠️ Transcript not found, trying audio...");
      }

      if (!usedTranscript) {
        const audioPath = await extractAudioFromVideo(videoUrl);
        if (audioPath) {
          transcript = await convertAudioToText(audioPath);
          if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
          if (transcript && transcript !== "Transcript not found from audio") {
            usedTranscript = true;
            context = `Audio transcription:\n${transcript.slice(0, 3000)}...`;
          }
        }
      }

      if (!usedTranscript) {
        const meta = await getVideoMetadata(videoUrl);
        context = meta
          ? `Video Info:\nTitle: ${meta.title}\nDescription: ${meta.description}`
          : `No transcript or captions available. Video: ${videoUrl}`;
      }


      if (!videoDoc) {
        videoDoc = await Video.create({
          url: videoUrl,
          transcript,
          createdBy: req.user?.id || null,
        });
      } else if (transcript) {
        videoDoc.transcript = transcript;
        await videoDoc.save();
      }
    } else {
      usedTranscript = true;
      context = `Transcript snippet:\n${transcript.slice(0, 3000)}...`;
    }

    const prompt = `
You are **EduMate AI**, an advanced educational assistant that provides **complete, formatted, and verified answers**.

User Question:
"${question}"

Context (from video or transcript):
${context}

Your task:
1. If the question is about *formulas, derivations, or physics/math concepts*, list **all relevant formulas** clearly.
2. Always format formulas in **LaTeX markdown style** like this: 
   \`$$ E = mc^2 $$\`
3. Include **variable definitions** (e.g., where M = total mass, r = position vector).
4. If multiple cases apply (discrete, continuous, 2D/3D), **include all cases**.
5. Keep the tone educational and concise (under 8 lines).

Output only the final explanation with formulas — no pretext, no "Here is the answer:".
`;

    console.log("🤖 Sending prompt to Gemini...");
    let answer = null;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const modelName =
          attempts === 2 ? "models/gemini-pro" : "models/gemini-2.5-flash";
        const model = genAI.getGenerativeModel({ model: modelName });

 const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        if (text && text.length > 10) {
          answer = text.trim();
          console.log(`✅ Gemini Answer (Model: ${modelName}):`, answer);
          break;
        } else {
          console.warn(`⚠️ Weak response from ${modelName}, retrying...`);
        }
      } catch (err) {
        attempts++;
        console.warn(`⚠️ Gemini attempt ${attempts} failed: ${err.message}`);
        if (attempts < maxAttempts) await new Promise((r) => setTimeout(r, 1500));
      }
    }

    if (!answer) {
      answer = "⚠️ Gemini is overloaded. Please try again shortly.";
    }


    await Question.create({ question, answer, video: videoDoc._id });

    if (req.user?._id) {
      await Activity.create({
        user: req.user._id,
        video: videoDoc._id,
        question,
      });
    }

    res.json({ question, answer, cached: false });
  } catch (error) {
    console.error("❌ askQuestion Error:", error);
    res.status(500).json({ error: "Gemini or server failed", details: error.message });
  }
};


export const getQuestionsByVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const questions = await Question.find({ video: videoId }).sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching Q&A", error });
  }
};

export const getUserHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const history = await Question.find({ user: userId })
      .populate("video", "url title")
      .sort({ createdAt: -1 });

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: "Error fetching history", error });
  }
};
