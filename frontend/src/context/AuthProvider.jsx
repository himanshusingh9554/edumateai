import { useState } from "react";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      // Guard against the string "undefined" or empty values
      if (!saved || saved === "undefined") {
        return null;
      }
      return JSON.parse(saved);
    } catch (error) {
      console.error("Error parsing user from localStorage", error);
      // If corrupted, clear it
      localStorage.removeItem("user");
      return null;
    }
  });
  const login = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    // Ensure token is also saved if your API relies on it separately
    if (userData.token) {
        localStorage.setItem("token", userData.token);
    }
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};