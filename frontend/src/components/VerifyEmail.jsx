import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { MailCheck } from "lucide-react"; // nice verification icon

function VerifyEmail({ setIsLoggedIn, setToken }) {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [timer, setTimer] = useState(15 * 60); // 15 minutes in seconds
  const [resendDisabled, setResendDisabled] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const isLoginFlow = location.state?.isLoginFlow || false; // To differentiate Signup vs Login OTP

  const API_URL = import.meta.env.VITE_API_URL;

  // Countdown timer effect
  useEffect(() => {
    if (timer <= 0) {
      setResendDisabled(false);
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLoginFlow ? "verify-login-otp" : "verify-email";
      const res = await axios.post(`${API_URL}/users/${endpoint}`, {
        email,
        otp,
      });

      setMessage(res.data.message);

      if (isLoginFlow) {
        const token = res.data.token;
        setIsLoggedIn(true);
        setToken(token);
        setTimeout(() => navigate("/"), 2000);
      } else {
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Verification failed.");
    }
  };

  const handleResendOTP = async () => {
    try {
      const res = await axios.post(`${API_URL}/users/resend-otp`, { email });
      setMessage(res.data.message);
      setTimer(15 * 60); // Reset timer
      setResendDisabled(true);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to resend OTP.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-cyan-400 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-green-100 p-4 rounded-full">
            <MailCheck className="w-10 h-10 text-green-600" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          {isLoginFlow ? "2FA Verification" : "Email Verification"}
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Enter the OTP sent to <span className="font-medium">{email}</span>
        </p>

        {/* Message */}
        {message && (
          <p className="text-center text-sm text-red-500 font-medium mb-4">
            {message}
          </p>
        )}

        {/* OTP Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              One-Time Password (OTP)
            </label>
            <input
              type="text"
              placeholder="Enter OTP"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-center tracking-widest font-mono text-lg"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Verify OTP
          </button>
        </form>

        {/* Resend OTP */}
        <div className="text-center mt-6">
          <button
            type="button"
            onClick={handleResendOTP}
            disabled={resendDisabled}
            className={`font-medium ${
              resendDisabled
                ? "text-gray-400 cursor-not-allowed"
                : "text-blue-600 hover:underline"
            }`}
          >
            Resend OTP
          </button>
          {resendDisabled && (
            <p className="text-sm text-gray-500 mt-2">
              You can resend OTP after:{" "}
              <span className="font-semibold">{formatTime(timer)}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
