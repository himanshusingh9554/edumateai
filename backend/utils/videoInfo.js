import axios from "axios";

export const getVideoMetadata = async (videoUrl) => {
  try {
    const videoId =
      videoUrl.split("v=")[1]?.split("&")[0] || videoUrl.split("/").pop();
    console.log("📹 Fetching metadata for video:", videoId);

    // Try YouTube oEmbed (very fast and free)
    const { data } = await axios.get(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    return {
      title: data.title,
      author: data.author_name,
      description: data.title || "No description",
    };
  } catch (err) {
    console.warn("⚠️ oEmbed metadata failed, trying fallback scrape...");
    try {
      const html = (await axios.get(videoUrl)).data;
      const title = html.match(/<title>(.*?)<\/title>/)?.[1] || "Unknown Title";
      return { title, description: "Fetched from HTML fallback." };
    } catch {
      console.warn("⚠️ Metadata fetch completely failed.");
      return null;
    }
  }
};
