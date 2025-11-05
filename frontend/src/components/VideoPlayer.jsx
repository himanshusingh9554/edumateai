export default function VideoPlayer({ videoUrl }) {
  if (!videoUrl)
    return (
      <div className="flex items-center justify-center h-[300px] border rounded-xl bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">
          Paste or search a YouTube video to start
        </p>
      </div>
    );

  const videoId =
    videoUrl.split("v=")[1]?.split("&")[0] || videoUrl.split("/").pop();

  return (
    <div className="rounded-xl overflow-hidden shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <iframe
        className="w-full h-[360px] md:h-[400px]"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube Video Player"
        allowFullScreen
      ></iframe>
    </div>
  );
}
