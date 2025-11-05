import { useEffect, useState } from "react";
import API from "../services/api";
import useDarkMode from "../hooks/useDarkMode";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useDarkMode();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);
  const [otpMessage, setOtpMessage] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await API.get("/auth/me");
      setUser(data);
      setName(data.name);
      setProfilePhoto(data.profilePhoto);
    } catch (err) {
      console.error("❌ Failed to fetch profile:", err);
      setError("Failed to load profile. Please re-login.");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const formData = new FormData();
      formData.append("name", name);
      if (preview) formData.append("profilePhoto", preview);

      const { data } = await API.put("/auth/update", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUser(data.user);
      setProfilePhoto(data.user.profilePhoto);
      localStorage.setItem("user", JSON.stringify(data.user));
      setMessage("Profile updated successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhoto = async () => {
    try {
      const { data } = await API.delete("/auth/delete-photo");
      setProfilePhoto(data.user.profilePhoto);
      setMessage("Profile photo removed!");
    } catch {
      setError("Failed to delete photo");
    }
  };

  const requestOtp = async () => {
    setOtpMessage("");
    setOtpError("");
    setOtpLoading(true);
    try {
      const { data } = await API.post("/auth/request-password-otp");
      setOtpMessage(data.message);
      setStep(2);
    } catch (err) {
      setOtpError(err.response?.data?.error || "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyAndChange = async (e) => {
    e.preventDefault();
    setOtpMessage("");
    setOtpError("");
    setOtpLoading(true);
    try {
      const { data } = await API.post("/auth/verify-password-otp", {
        otp,
        newPassword,
      });
      setOtpMessage(data.message);
      setStep(3);
      setTimeout(() => {
        localStorage.clear();
        window.location.href = "/login";
      }, 2000);
    } catch (err) {
      setOtpError(err.response?.data?.error || "Invalid OTP or failed request");
    } finally {
      setOtpLoading(false);
    }
  };

  if (!user)
    return (
      <p className="text-center mt-10 text-gray-500">Loading profile...</p>
    );

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
        <h1 className="text-2xl font-bold text-blue-500">My Profile</h1>
        <div className="flex gap-3 items-center">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="border px-3 py-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
          <button
            onClick={() => (window.location.href = "/dashboard")}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Back
          </button>
        </div>
      </header>

      <div
        className={`max-w-lg mx-auto rounded-lg shadow p-6 ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        {message && <p className="text-green-500 text-sm mb-2">{message}</p>}

        <form onSubmit={handleUpdate}>
          <div className="flex flex-col items-center mb-4">
            <img
              src={
                preview
                  ? URL.createObjectURL(preview)
                  : profilePhoto ||
                    "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border shadow mb-3"
            />
            <div className="flex gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPreview(e.target.files[0])}
                className="text-sm"
              />
              <button
                type="button"
                onClick={handleDeletePhoto}
                className="text-red-500 hover:underline text-sm"
              >
                Delete
              </button>
            </div>
          </div>

          <label className="block mb-1 font-medium">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded w-full p-2 mb-3 dark:bg-gray-700 dark:border-gray-600"
          />

          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            value={user.email || ""}
            readOnly
            className="border rounded w-full p-2 mb-4 bg-gray-100 dark:bg-gray-700 dark:border-gray-600 cursor-not-allowed"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Password Section */}
      <div
        className={`max-w-lg mx-auto mt-8 rounded-lg shadow p-6 ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <h3 className="text-lg font-semibold text-blue-600 mb-3">
          Change Password via Email OTP
        </h3>

        {otpError && <p className="text-red-500 mb-2">{otpError}</p>}
        {otpMessage && <p className="text-green-500 mb-2">{otpMessage}</p>}

        {step === 1 && (
          <button
            onClick={requestOtp}
            disabled={otpLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {otpLoading ? "Sending OTP..." : "Send OTP to Email"}
          </button>
        )}

        {step === 2 && (
          <form onSubmit={verifyAndChange} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600"
              required
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600"
              required
            />
            <button
              type="submit"
              disabled={otpLoading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              {otpLoading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}

        {step === 3 && (
          <p className="text-green-600 font-medium mt-2">
            ✅ Password updated successfully! Redirecting to login...
          </p>
        )}
      </div>
    </div>
  );
}
