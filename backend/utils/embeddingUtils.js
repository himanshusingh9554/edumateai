// utils/embeddingUtils.js
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate embeddings (vector representations) for a given text
 * to perform similarity searches.
 * 
 * @param {string} text - Input text (transcript or question)
 * @returns {Array<number>} - Embedding vector
 */
export const generateEmbedding = async (text) => {
  if (!text) return [];
  try {
    const res = await openai.embeddings.create({
      model: "text-embedding-3-small", // cheap & efficient
      input: text,
    });
    return res.data[0].embedding;
  } catch (err) {
    console.error("Embedding generation error:", err.message);
    return [];
  }
};

/**
 * Calculates cosine similarity between two vectors
 */
export const cosineSimilarity = (vecA, vecB) => {
  const dot = vecA.reduce((acc, v, i) => acc + v * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((acc, v) => acc + v * v, 0));
  const normB = Math.sqrt(vecB.reduce((acc, v) => acc + v * v, 0));
  return dot / (normA * normB);
};
