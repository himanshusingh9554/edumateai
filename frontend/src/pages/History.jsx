import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import useDarkMode from "../hooks/useDarkMode";

export default function History() {
  const [darkMode, setDarkMode] = useDarkMode();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await API.get("/history");
        setHistory(data);
      } catch {
        setError("Unable to fetch your history. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleVideoClick = (video) => {
 navigate("/dashboard", { state: { videoUrl: video.url } });
  };

  return (
    <div
      className={`min-h-screen p-6 transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"
      }`}
    >
      <header
        className={`shadow p-4 flex justify-between items-center mb-6 ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <h1 className="text-2xl font-bold text-blue-500">Your Activity History</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="border px-3 py-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
          >
            Back
          </button>
        </div>
      </header>

      {loading ? (
        <p className="text-center text-gray-500">Loading your activity...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : history.length === 0 ? (
        <div className="text-center mt-20">
          <p>No activity yet 🕒</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Go to Dashboard
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {history.map((item) => (
            <div
              key={item._id}
              onClick={() => handleVideoClick(item.video)}
              className="p-3 rounded-lg shadow hover:shadow-lg transition cursor-pointer border dark:border-gray-700 dark:bg-gray-800"
            >
              <img
                src={`https://img.youtube.com/vi/${
                  item.video.url.split("v=")[1] || item.video.url.split("/").pop()
                }/0.jpg`}
                alt={item.video.title}
                className="w-full h-40 object-cover rounded-md mb-2"
              />
              <h3 className="font-semibold text-sm line-clamp-2">{item.video.title}</h3>
              <p className="text-xs text-gray-500 mt-1">
                Last viewed: {new Date(item.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
