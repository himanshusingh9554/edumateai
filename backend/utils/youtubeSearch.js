import ytsr from "ytsr";

export const searchYouTubeVideos = async (query) => {
  try {
    const filters1 = await ytsr.getFilters(query);
    const filterVideo = filters1.get('Type').get('Video');
    const searchResults = await ytsr(filterVideo.url, { limit: 10 });

    return searchResults.items.map((item) => ({
      videoId: item.id,
      title: item.title,
      thumbnail: item.bestThumbnail?.url || null,
      channel: item.author?.name,
      views: item.views,
      duration: item.duration,
    }));
  } catch (err) {
    console.error("❌ Search failed:", err.message);
    return [];
  }
};