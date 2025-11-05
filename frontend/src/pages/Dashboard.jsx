import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // ✅ Added useLocation
import API from "../services/api";
import VideoPlayer from "../components/VideoPlayer";
import ChatBox from "../components/Chatbox";
import useDarkMode from "../hooks/useDarkMode";

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const location = useLocation(); // ✅ Get state passed from History
  const [videoUrl, setVideoUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [error, setError] = useState(null);
  const [nextPage, setNextPage] = useState(null);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [darkMode, setDarkMode] = useDarkMode();

 useEffect(() => {
    if (location.state?.videoUrl) {
       setVideoUrl(location.state.videoUrl);
       window.history.replaceState({}, document.title);
    }
    else {
       const savedVideo = localStorage.getItem("selectedVideo");
       if (savedVideo) {
         const parsed = JSON.parse(savedVideo);
         if (parsed?.url) {
           setVideoUrl(parsed.url);
           localStorage.removeItem("selectedVideo");
         }
       }
    }
  }, [location]);

  useEffect(() => {
    if (searchQuery.trim() === "") return;
    if (typingTimeout) clearTimeout(typingTimeout);
    const timeout = setTimeout(() => handleSearch(), 1000);
    setTypingTimeout(timeout);
  }, [searchQuery]);

  const fetchMore = async (page) => {
  try {
       const { data } = await API.get(`/videos/search/${encodeURIComponent(searchQuery)}?page=${page}`);
       setSearchResults((prev) => [...prev, ...data.results]);
       setNextPage(data.nextPage);
     } catch (error) {
      console.error("Pagination fetch error:", error);
    }
  };

  const handleSearch = async () => {
    setError(null);
    const input = searchQuery.trim();
    if (!input) return;

    if (input.includes("youtube.com") || input.includes("youtu.be")) {
      setVideoUrl(input);
      setSearchResults([]);
      return;
    }

    setLoadingSearch(true);
    try {
   const { data } = await API.get(`/videos/search/${encodeURIComponent(input)}?page=1`);
      if (Array.isArray(data.results)) {
        setSearchResults(data.results);
        setNextPage(data.nextPage);
      } else throw new Error("Invalid search response format");
    } catch (err) {
      console.error("Search failed:", err);
      setError("Search failed. Try again later.");
    } finally {
      setLoadingSearch(false);
    }
  };
  const handleLogout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login"); // ✅ Use navigate
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* Header */}
     <header
        className={`shadow p-4 flex justify-between items-center ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <h1 className="text-2xl font-bold text-blue-500">EduMate AI Dashboard</h1>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="border px-3 py-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
          
          <button
            onClick={() => navigate("/profile")}
            className="text-sm bg-gray-200 dark:bg-gray-700 px-3 py-1.5 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            👤 Profile
          </button>
          
          <button
            onClick={() => navigate("/history")}
            className="text-sm bg-gray-200 dark:bg-gray-700 px-3 py-1.5 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            🕒 History
          </button>
          
          {/* ✅ FIXED: Only one logout button using the handler */}
          <button
            onClick={handleLogout}
            className="text-sm bg-red-500 text-white px-3 py-1.5 rounded hover:bg-red-600 transition"
          >
            🚪 Logout
          </button>

          {/* ✅ FIXED: Added Profile Photo & Name */}
          <div className="flex items-center gap-2">
             {user?.profilePhoto && (
               <img 
                 src={user.profilePhoto} 
                 alt="Profile" 
                 className="w-8 h-8 rounded-full object-cover border"
               />
             )}
             <span className="text-gray-600 dark:text-gray-300 font-medium">
               {user?.name || "Student"}
             </span>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex mb-4 gap-2">
            <input
              type="text"
              placeholder="Search or paste YouTube link..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:border-gray-700"
            />
          </div>

          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

          {!loadingSearch && searchResults.length > 0 && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {searchResults.map((v) => (
                  <div
                    key={v.videoId}
                    className="cursor-pointer border rounded-md p-2 hover:shadow-md transition bg-white dark:bg-gray-800"
                    onClick={() => {
                      setVideoUrl(`https://www.youtube.com/watch?v=${v.videoId}`);
                      setSearchResults([]);
                      setSearchQuery("");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    <img
                      src={v.thumbnail}
                      alt={v.title}
                      className="rounded-md w-full h-28 object-cover"
                    />
                    <p className="text-xs mt-1 line-clamp-2">{v.title}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                      {v.duration} • {v.channel}
                    </p>
                  </div>
                ))}
              </div>
              {nextPage && (
                <div className="text-center mt-3">
                  <button
                    onClick={() => fetchMore(nextPage)}
                    className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm px-4 py-2 rounded-md"
                  >
                    Next Page →
                  </button>
                </div>
              )}
            </>
          )}

          <VideoPlayer videoUrl={videoUrl} />
        </div>

        <div className="h-[80vh]">
          <ChatBox videoUrl={videoUrl} />
        </div>
      </main>
    </div>
  );
}
