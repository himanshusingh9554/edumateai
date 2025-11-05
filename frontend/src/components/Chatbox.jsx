import { useState } from "react";
import API from "../services/api";
import { MathJax } from "better-react-mathjax";
export default function ChatBox({ videoUrl }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

const handleAsk = async () => {
  const currentQuestion = question.trim();
    if (!currentQuestion || !videoUrl) return;

  const userMsg = { role: "user", text: currentQuestion };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion("");
    setLoading(true);

    try {
      const { data } = await API.post("/questions/ask", { question: currentQuestion, videoUrl });
      const botMsg = { role: "bot", text: data.answer };
      setMessages((prev) => [...prev, botMsg]);
    } catch  {
      const errMsg = { role: "bot", text: "⚠️ Error: Could not get response." };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
      setQuestion("");
    }
  };

  return (
    <div className="flex flex-col h-full border rounded-md bg-white dark:bg-gray-800">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg ${
              msg.role === "user"
                ? "bg-blue-500 text-white self-end max-w-[75%]"
                : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 self-start max-w-[90%]"
            }`}
          >
            {msg.role === "bot" ? (
              <MathJax dynamic inline={false}>
                <div className="whitespace-pre-wrap">{msg.text}</div>
              </MathJax>
            ) : (
              <div>{msg.text}</div>
            )}
          </div>
        ))}

        {loading && (
          <div className="text-gray-500 text-sm animate-pulse">Thinking...</div>
        )}
      </div>

      {/* Input section */}
      <div className="p-3 border-t dark:border-gray-700 flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about this video..."
          className="flex-1 px-3 py-2 border rounded-md dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-400 outline-none"
        />
        <button
          onClick={handleAsk}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
        >
          Ask
        </button>
      </div>
    </div>
  );
}
