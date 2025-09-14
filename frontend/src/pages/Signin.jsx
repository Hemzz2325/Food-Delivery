// src/pages/Signin.jsx
import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice.js";
import { ClipLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../firebase";
import { serverUrl } from "../config";

const SignIn = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Debug function to test backend connection
  const testBackendConnection = async () => {
    try {
      console.log("🔍 Testing backend connection to:", serverUrl);
      const response = await axios.get(`${serverUrl}/health`, {
        timeout: 5000,
        withCredentials: true
      });
      console.log("✅ Backend connection successful:", response.data);
      return true;
    } catch (err) {
      console.error("❌ Backend connection failed:", err.message);
      console.error("   URL attempted:", `${serverUrl}/health`);
      if (err.code === 'ECONNREFUSED') {
        console.error("   Make sure backend is running on port 8000");
      }
      return false;
    }
  };

  // Normal email/password login
  const handleSignIn = async (e) => {
    e?.preventDefault?.();
    setError("");
    setLoading(true);

    try {
      console.log("🔐 Attempting signin to:", `${serverUrl}/api/auth/signin`);
      
      // Test backend connection first
      const isBackendRunning = await testBackendConnection();
      if (!isBackendRunning) {
        throw new Error("Backend server is not running. Please start the backend server on port 8000.");
      }

      const res = await axios.post(
        `${serverUrl}/api/auth/signin`,
        { email, password },
        { 
          withCredentials: true,
          timeout: 10000, // 10 second timeout
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("✅ Signin successful:", res.data);

      const { token, user } = res.data || {};
      if (token) {
        localStorage.setItem("authToken", token);
        console.log("🔑 Token saved to localStorage");
      }
      if (user) {
        dispatch(setUserData(user));
        console.log("👤 User data saved to Redux:", user);
      }

      navigate("/");
    } catch (err) {
      console.error("❌ Signin Error:", err);
      
      let errorMessage = "Signin failed. Please try again.";
      
      if (err.code === 'ECONNREFUSED') {
        errorMessage = "Cannot connect to server. Please make sure the backend is running on port 8000.";
      } else if (err.code === 'ENOTFOUND') {
        errorMessage = "Server not found. Please check your network connection.";
      } else if (err.response?.status === 404) {
        errorMessage = "Signin endpoint not found. Please check backend routes.";
      } else if (err.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Google login
  const handleGoogleAuth = async () => {
    setError("");
    setLoading(true);

    try {
      console.log("🔍 Testing backend connection before Google auth...");
      const isBackendRunning = await testBackendConnection();
      if (!isBackendRunning) {
        throw new Error("Backend server is not running. Please start the backend server on port 8000.");
      }

      console.log("🔥 Initiating Google signin...");
      const firebaseResult = await signInWithPopup(auth, provider);
      
      const payload = {
        fullName: firebaseResult?.user?.displayName || "",
        email: firebaseResult?.user?.email || "",
      };

      console.log("📤 Sending Google auth data to backend:", payload);

      const res = await axios.post(`${serverUrl}/api/auth/google-auth`, payload, {
        withCredentials: true,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log("✅ Google auth successful:", res.data);

      const { token, user } = res.data || {};
      if (token) {
        localStorage.setItem("authToken", token);
        console.log("🔑 Token saved to localStorage");
      }
      if (user) {
        dispatch(setUserData(user));
        console.log("👤 User data saved to Redux:", user);
      }

      navigate("/");
    } catch (err) {
      console.error("❌ Google Signin Error:", err);
      
      let errorMessage = "Google Auth failed. Try again.";
      
      if (err.code === 'ECONNREFUSED') {
        errorMessage = "Cannot connect to server. Please make sure the backend is running on port 8000.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-rose-50">
      <div className="max-w-md w-full p-6 rounded-lg shadow-lg bg-white border border-gray-300">
        <h1 className="text-3xl font-bold mb-2 text-red-500">Country-Kitchen</h1>
        <p className="text-gray-500">Sign in to continue enjoying tasty food</p>

        {/* Backend Status Indicator */}
        <div className="mt-2 text-xs text-gray-500">
          Backend: {serverUrl}
        </div>

        <form onSubmit={handleSignIn}>
          {/* Email */}
          <div className="mt-4">
            <label className="block text-gray-700 font-medium mb-1">E-mail</label>
            <input
              type="email"
              className="w-full border rounded-lg px-3 py-3 focus:outline-none focus:border-red-600 border-neutral-300"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div className="mt-4">
            <label className="block text-gray-700 font-medium mb-1">Password</label>
            <input
              type="password"
              className="w-full border rounded-lg px-3 py-3 focus:outline-none focus:border-red-600 border-neutral-300"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* Forgot Password */}
          <div
            className="text-right mb-4 text-red-500 cursor-pointer"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot Password
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-2 text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`mt-6 w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-colors ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? <ClipLoader size={20} color="#fff" /> : "Sign In"}
          </button>
        </form>

        {/* Google Signin */}
        <button
          onClick={handleGoogleAuth}
          disabled={loading}
          className={`mt-4 w-full border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <FcGoogle size={20} />
          <span>{loading ? "Processing..." : "Sign in with Google"}</span>
        </button>

        {/* Signup link */}
        <p className="text-center mt-2 cursor-pointer" onClick={() => navigate("/signup")}>
          Don't have an account? <span className="text-red-500">Sign up</span>
        </p>
      </div>
    </div>
  );
};

export default SignIn;