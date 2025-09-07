import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice.js";
import { ClipLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../../firebase";
import { serverUrl } from "../config";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const navigate = useNavigate();

  // Handle normal sign in
  const handleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(
        `${serverUrl}/api/auth/signin`,
        { email, password },
        { withCredentials: true }
      );
  const { token, user } = res.data;
  if (token) localStorage.setItem("authToken", token);
  dispatch(setUserData(user));
  // Redirect to home; Home will render the correct dashboard based on role
  navigate("/");
      
    } catch (err) {
      console.error("Signin Error:", err.response?.data || err);
      setError(err.response?.data?.message || "Signin failed");
    } finally {
      setLoading(false);
    }
  };

  // Handle Google authentication
  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const res = await axios.post(
        `${serverUrl}/api/auth/google-auth`,
        {
          fullName: result.user.displayName,
          email: result.user.email,
        },
        { withCredentials: true }
      );
      const { token, user } = res.data;
      if (token) localStorage.setItem("authToken", token);
      dispatch(setUserData(user));
      navigate("/");
    } catch (err) {
      console.error("Google Signin Error", err);
      setError(err.response?.data?.message || "Google Auth failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-rose-50">
      <div className="max-w-md w-full p-6 rounded-lg shadow-lg bg-white border border-gray-300">
        <h1 className="text-3xl font-bold mb-2 text-red-500">Country-Kitchen</h1>
        <p className="text-gray-500">Sign in to continue enjoying tasty food</p>

        {/* Email Input */}
        <div className="mt-4">
          <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
            E-mail
          </label>
          <input
            type="email"
            id="email"
            className="w-full border rounded-lg px-3 py-3 focus:outline-none focus:border-red-600 border-neutral-300"
            placeholder="Enter your Email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password Input */}
        <div className="mt-4">
          <label htmlFor="password" className="block text-gray-700 font-medium mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            className="w-full border rounded-lg px-3 py-3 focus:outline-none focus:border-red-600 border-neutral-300"
            placeholder="Enter your Password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Forgot Password */}
        <div
          className="text-right mb-4 text-red-500 cursor-pointer"
          onClick={() => navigate("/forgot-password")}
        >
          Forgot Password
        </div>

        {/* Error Message */}
        {error && <p className="text-red-500 text-center mb-2">{error}</p>}

        {/* Sign In Button */}
        <button
          className={`mt-6 w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-colors cursor-pointer ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={handleSignIn}
          disabled={loading}
        >
  {loading ? <ClipLoader size={20} color="#ffffff" /> : "Sign In"}
        </button>

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleAuth}
          className={`mt-4 w-full border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={loading}
        >
          <FcGoogle size={20} />
          <span>{loading ? "Processing..." : "Sign in with Google"}</span>
        </button>

        {/* Sign Up Link */}
        <p
          className="text-center mt-2 cursor-pointer"
          onClick={() => navigate("/signup")}
        >
          Want to create a new Account? <span className="text-red-500">Sign up</span>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
