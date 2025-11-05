import React from "react";
import ReactDOM from "react-dom/client";
import { StrictMode } from "react";
import { MathJaxContext } from "better-react-mathjax";
import App from "./App.jsx";
import "./index.css";

const config = {
  loader: { load: ["[tex]/ams"] },
  tex: {
    packages: { "[+]": ["ams"] },
    inlineMath: [["$", "$"], ["\\(", "\\)"]],
    displayMath: [["$$", "$$"]],
  },
  svg: { fontCache: "global" },
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MathJaxContext config={config}>
      <App />
    </MathJaxContext>
  </StrictMode>
);
