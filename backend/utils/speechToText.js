import fs from "fs";
import speech from "@google-cloud/speech";

export const convertAudioToText = async (audioPath) => {
  try {
    console.log("🧠 Converting audio to text...");
    const client = new speech.SpeechClient();

    const audioBytes = fs.readFileSync(audioPath).toString("base64");

    const request = {
      audio: { content: audioBytes },
      config: {
        encoding: "MP3",
        sampleRateHertz: 44100,
        languageCode: "en-IN",
        enableAutomaticPunctuation: true,
      },
    };

    const [response] = await client.recognize(request);
    const transcript = response.results.map(r => r.alternatives[0].transcript).join(" ");

    if (!transcript || transcript.trim().length < 10) {
      console.warn("⚠️ No speech detected in audio.");
      return "Transcript not found from audio";
    }

    console.log("🗣️ Audio converted successfully.");
    return transcript;
  } catch (error) {
    console.error("❌ Speech-to-text error:", error.message);
    return "Transcript not found from audio";
  }
};
