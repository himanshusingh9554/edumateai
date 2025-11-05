// utils/responseFormatter.js

/**
 * Cleans AI answer by trimming, fixing spacing and punctuation.
 *
 * @param {string} text - Raw AI answer
 * @returns {string} - Clean formatted answer
 */
export const formatAnswer = (text) => {
  if (!text) return "";
  let cleaned = text.trim();

  // Replace double newlines with one
  cleaned = cleaned.replace(/\n{2,}/g, "\n");

  // Remove unnecessary quotes or markdown syntax
  cleaned = cleaned.replace(/["*`#]/g, "");

  // Ensure sentence ends with punctuation
  if (!/[.?!]$/.test(cleaned)) cleaned += ".";

  return cleaned;
};
