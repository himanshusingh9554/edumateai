import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const listModels = async () => {
  try {
    const result = await genAI.listModels();
    console.log("✅ Available Models:");
    console.dir(result, { depth: null });
  } catch (err) {
    console.error("❌ Error listing models:", err.message);
  }
};

listModels();
