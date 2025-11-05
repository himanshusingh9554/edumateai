import { useState } from "react";
import API from "../services/api";

export default function VerifyOtp() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post("/auth/verify-otp", { email, otp });
      setMessage(data.message);
    } catch (err) {
      setMessage(err.response?.data?.error || "Verification failed");
    }
  };

  return (
    <div className="max-w-sm mx-auto p-6 bg-white shadow-md mt-10 rounded">
      <h2 className="text-xl font-bold mb-4 text-center">Verify OTP</h2>
      <form onSubmit={handleVerify}>
        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 mb-3"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter OTP"
          className="w-full border p-2 mb-3"
          onChange={(e) => setOtp(e.target.value)}
        />
        <button className="w-full bg-green-500 text-white py-2 rounded">Verify</button>
      </form>
      {message && <p className="text-center text-sm mt-3 text-blue-600">{message}</p>}
    </div>
  );
}
