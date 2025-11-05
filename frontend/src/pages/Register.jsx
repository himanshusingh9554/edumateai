import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Register() {
  const [step, setStep] = useState(1); // 1 = signup form, 2 = OTP verify
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const { data } = await API.post("/auth/register", form);
      setMessage(data.message);
      setStep(2);
    } catch (err) {
      setMessage(err.response?.data?.error || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post("/auth/verify-otp", { email: form.email, otp });
      setMessage(data.message);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setMessage(err.response?.data?.error || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await API.post("/auth/resend-otp", { email: form.email });
      setMessage("OTP resent successfully!");
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to resend OTP.");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        {step === 1 ? (
          <>
            <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">
              EduMate AI Signup
            </h2>
            <form onSubmit={handleSignup}>
              <input
                type="text"
                placeholder="Full Name"
                className="w-full border p-3 rounded mb-3"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full border p-3 rounded mb-3"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full border p-3 rounded mb-4"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition"
              >
                {loading ? "Creating Account..." : "Sign Up"}
              </button>
            </form>
            {message && <p className="text-center text-sm mt-3 text-blue-600">{message}</p>}

            <p className="text-center mt-4 text-sm">
              Already have an account?{" "}
              <span
                onClick={() => navigate("/login")}
                className="text-blue-600 hover:underline cursor-pointer"
              >
                Login
              </span>
            </p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-center mb-6 text-green-600">Verify Your Email</h2>
            <p className="text-sm text-gray-600 mb-3 text-center">
              Enter the OTP sent to your email: <b>{form.email}</b>
            </p>
            <form onSubmit={handleVerify}>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                className="w-full border p-3 rounded mb-4"
                onChange={(e) => setOtp(e.target.value)}
              />
              <button
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded transition"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>
            <p
              onClick={handleResend}
              className="text-blue-600 text-center mt-3 cursor-pointer hover:underline text-sm"
            >
              Resend OTP
            </p>
            {message && <p className="text-center text-sm mt-3 text-blue-600">{message}</p>}
          </>
        )}
      </div>
    </div>
  );
}
