import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Lock } from "lucide-react"; // Clean lock icon

function Login({ setIsLoggedIn, setToken }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/login`,
        form
      );

      // Case: Normal user requires OTP
      if (response.data.requires2FA) {
        setMsg("OTP sent to your email.");
        navigate("/verify-email", {
          state: { email: form.email, isLoginFlow: true },
        });
        return;
      }

      // Case: Direct login
      const token = response.data.token;
      const decoded = jwtDecode(token);
      const role = decoded.role;

      // Success
      setMsg(response.data.message);
      setIsLoggedIn(true);
      setToken(token);

      if (role === "admin") {
        navigate("/admin");
      } else if (role === "superadmin") {
        navigate("/superadmin");
      } else {
        navigate("/");
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setMsg(err.response.data.message);
      } else {
        setMsg("Login failed. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-cyan-400 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-blue-100 p-4 rounded-full">
            <Lock className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Welcome Back
        </h1>
        <p className="text-center text-gray-500 mb-6">
          Please login to continue
        </p>

        {/* Message */}
        {msg && (
          <p className="text-center text-sm text-red-500 font-medium mb-4">
            {msg}
          </p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>

        {/* Extra Links */}
        <div className="mt-6 space-y-2">
          <p className="text-center text-gray-600 text-sm">
            Don’t have an account?{" "}
            <a
              href="/signup"
              className="text-blue-600 font-semibold hover:underline"
            >
              Sign Up
            </a>
          </p>
          <p className="text-center text-sm">
            <a
              href="/forgot-password"
              className="text-blue-600 font-semibold hover:underline"
            >
              Forgot Password?
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
