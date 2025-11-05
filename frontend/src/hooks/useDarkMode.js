import { useEffect, useState } from "react";
import API from "../services/api";

export default function useDarkMode() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");

    const token = localStorage.getItem("token");
    if (token) {
      API.post("/users/theme", { theme: darkMode ? "dark" : "light" }).catch(
        () => {}
      );
    }
  }, [darkMode]);

  return [darkMode, setDarkMode];
}
