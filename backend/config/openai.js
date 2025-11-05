import OpenAI from "openai";

console.log("🔑 OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "Loaded ✅" : "Missing ❌");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default openai;
