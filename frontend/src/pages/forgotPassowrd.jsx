import { useState } from "react";
import API from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1); // 1=email → 2=otp+password → 3=success
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 Step 1: Send OTP
  const sendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const { data } = await API.post("/auth/forgot-password", { email });
      setMessage(data.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Step 2: Reset Password
  const resetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const { data } = await API.post("/auth/reset-password", {
        email,
        otp,
        newPassword,
      });
      setMessage(data.message);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Step 2.5: Resend OTP (optional)
  const resendOtp = async () => {
    try {
      await API.post("/auth/forgot-password", { email });
      setMessage("✅ New OTP sent to your email!");
    } catch {
      setError("Failed to resend OTP");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">
          Forgot Password
        </h2>

        {/* Success or error message */}
        {error && <p className="text-red-500 text-center mb-3">{error}</p>}
        {message && !error && (
          <p className="text-green-600 text-center mb-3">{message}</p>
        )}

        {/* Step 1: Send OTP */}
        {step === 1 && (
          <form onSubmit={sendOtp}>
            <label className="block mb-1 text-sm font-semibold">Email</label>
            <input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-2 mb-4 rounded focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* Step 2: OTP + New Password */}
        {step === 2 && (
          <form onSubmit={resetPassword}>
            <label className="block mb-1 text-sm font-semibold">OTP</label>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border p-2 mb-3 rounded focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />

            <label className="block mb-1 text-sm font-semibold">
              New Password
            </label>
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border p-2 mb-3 rounded focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            <p
              onClick={resendOtp}
              className="text-center text-sm mt-3 text-blue-500 hover:underline cursor-pointer"
            >
              Resend OTP
            </p>
          </form>
        )}

        {/* Step 3: Success screen */}
        {step === 3 && (
          <div className="text-center">
            <h3 className="text-green-600 font-semibold mb-2">
              ✅ Password Reset Successful!
            </h3>
            <p className="text-gray-600 mb-4">You can now login with your new password.</p>
            <a
              href="/login"
              className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Go to Login
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
               