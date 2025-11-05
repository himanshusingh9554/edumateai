import React from "react";
import { useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import useDarkMode from "../hooks/useDarkMode";

export default function Home() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useDarkMode();

  // Animation helper
  const fadeIn = (delay = 0) => ({
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay },
    viewport: { once: true },
  });

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* Navbar */}
      <motion.header
        className={`flex flex-wrap justify-between items-center px-6 py-4 shadow ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h1
          className="text-2xl font-bold text-blue-500 cursor-pointer"
          onClick={() => navigate("/")}
        >
          EduMate AI
        </h1>

        <div className="flex flex-wrap items-center gap-3 mt-2 md:mt-0">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="border px-3 py-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/register")}
            className="border border-blue-500 text-blue-500 px-4 py-2 rounded hover:bg-blue-50 dark:hover:bg-gray-700 transition"
          >
            Register
          </button>
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.section
        className="text-center py-16 px-6 max-w-3xl mx-auto"
        {...fadeIn(0.2)}
      >
        <h2 className="text-4xl font-extrabold mb-4 text-blue-500">
          Learn Smarter with EduMate AI 🎓
        </h2>
        <p className="text-lg mb-6 leading-relaxed">
          EduMate AI helps you understand any YouTube video using the power of
          Gemini AI. Ask questions directly from video content, chat for
          clarifications, and enhance your learning — all in one place.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/dashboard")}
          className="bg-blue-600 text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-blue-700 transition"
        >
          Try Dashboard →
        </motion.button>
      </motion.section>

      {/* Features Section */}
      <motion.section
        className={`py-16 px-8 ${
          darkMode ? "bg-gray-800" : "bg-white"
        } transition-colors`}
        {...fadeIn(0.3)}
      >
        <h3 className="text-3xl font-bold text-center mb-10">
          🚀 Current Features
        </h3>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              title: "🎥 YouTube Integration",
              desc: "Paste any YouTube link — EduMate AI fetches the transcript and helps you ask intelligent questions about it.",
            },
            {
              title: "🤖 Gemini AI Answers",
              desc: "Powered by Google Gemini, get concise, accurate, and educational explanations for any topic.",
            },
            {
              title: "💬 Chat-based Learning",
              desc: "Ask follow-up questions about any video and receive real-time AI-powered explanations.",
            },
            {
              title: "🕒 Watch History",
              desc: "Track your learning journey — revisit your previously watched and searched videos.",
            },
            {
              title: "👤 Profile Customization",
              desc: "Update your name, profile photo, and password securely with verified email authentication.",
            },
            {
              title: "🌗 Dark / Light Mode",
              desc: "Switch themes for your comfort, automatically saved to your preferences.",
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="p-6 rounded-lg shadow-md hover:shadow-xl transition bg-gray-50 dark:bg-gray-700"
              {...fadeIn(0.2 + i * 0.1)}
            >
              <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Roadmap Section */}
      <motion.section className="py-16 px-8" {...fadeIn(0.4)}>
        <h3 className="text-3xl font-bold text-center mb-8 text-blue-500">
          🔮 Future Roadmap
        </h3>
        <ul className="max-w-3xl mx-auto space-y-4 text-lg list-disc pl-6">
          {[
            "📚 AI-generated video summaries and notes",
            "🧠 Personalized learning analytics and insights",
            "💡 Voice-based interaction with EduMate AI",
            "📈 Progress tracking and performance reports",
            "👥 Social learning and discussion communities",
            "🏆 Premium plan with priority Gemini AI access",
          ].map((item, index) => (
            <motion.li key={index} {...fadeIn(0.1 * index)}>
              {item}
            </motion.li>
          ))}
        </ul>
      </motion.section>

      {/* Footer */}
      <motion.footer
        className={`text-center py-6 mt-10 ${
          darkMode ? "bg-gray-800 text-gray-400" : "bg-gray-200 text-gray-700"
        }`}
        {...fadeIn(0.5)}
      >
        <p>© {new Date().getFullYear()} EduMate AI. All Rights Reserved.</p>
      </motion.footer>
    </div>
  );
}
