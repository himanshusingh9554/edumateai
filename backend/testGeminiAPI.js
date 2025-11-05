import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const testGeminiAPI = async () => {
  try {
    console.log("🔍 Checking Gemini API key and model availability...");
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models?key=${GEMINI_API_KEY}`
    );

    const data = await response.json();
    console.log("✅ Raw response:");
    console.dir(data, { depth: null });
    if (data.models) {
      console.log("\n✅ Available Models:");
      data.models.forEach((m) => console.log("→", m.name));
    } else {
      console.log(
        "\n❌ No models found — if error shows 'UNAUTHENTICATED', ensure URL uses ?key=YOUR_API_KEY"
      );
    }
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
};

testGeminiAPI();
