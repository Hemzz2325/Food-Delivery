import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import axios from "axios";
import { serverUrl } from "../config.js";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../firebase"; // ✅ use shared provider
import { ClipLoader } from "react-spinners";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

const Signup = () => {
  const [role, setRole] = useState("user");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Normal signup
  const handleSignup = async (e) => {
    e?.preventDefault?.();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${serverUrl}/api/auth/signup`,
        { fullName, email, password, mobile, role },
        { withCredentials: true }
      );

      const { token, user } = res.data || {};
      if (token) localStorage.setItem("authToken", token);
      if (user) dispatch(setUserData(user));

      navigate("/");
    } catch (err) {
      console.error("Signup Error:", err?.response?.data || err);
      setError(err?.response?.data?.message || "Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Google signup
  const handleGoogleAuth = async () => {
    setError("");
    if (!/^\d{10}$/.test(mobile)) {
      setError("Enter a valid 10-digit mobile number for Google signup");
      return;
    }

    setLoading(true);

    try {
      const firebaseResult = await signInWithPopup(auth, provider);

      const payload = {
        fullName: firebaseResult?.user?.displayName || "",
        email: firebaseResult?.user?.email || "",
        mobile,
        role,
      };

      const res = await axios.post(`${serverUrl}/api/auth/google-auth`, payload, {
        withCredentials: true,
      });

      const { token, user } = res.data || {};
      if (token) localStorage.setItem("authToken", token);
      if (user) dispatch(setUserData(user));

      navigate("/");
    } catch (err) {
      console.error("Google Signup Error:", err?.response?.data || err);
      setError(err?.response?.data?.message || "Google signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-rose-50">
      <div className="max-w-md w-full p-6 rounded-lg shadow-lg bg-white border border-gray-300">
        <h1 className="text-3xl font-bold mb-2 text-red-500">Country-Kitchen</h1>
        <p className="text-gray-500">Create your account to enjoy tasty food</p>

        {/* Full Name */}
        <div className="mt-4">
          <label className="block text-gray-700 font-medium mb-1">Full Name</label>
          <input
            type="text"
            className="w-full border rounded-lg px-3 py-3 focus:outline-none focus:border-red-600 border-neutral-300"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            disabled={loading}
          />
        </div>

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

        {/* Mobile */}
        <div className="mt-4">
          <label className="block text-gray-700 font-medium mb-1">Mobile Number</label>
          <input
            type="text"
            className="w-full border rounded-lg px-3 py-3 focus:outline-none focus:border-red-600 border-neutral-300"
            placeholder="Enter your 10-digit mobile number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
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

        {/* Role */}
        <div className="mt-4">
          <label className="block text-gray-700 font-medium mb-1">Role</label>
          <div className="flex gap-2">
            {["user", "owner", "delivery boy"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 border rounded-lg px-3 py-2 text-center font-medium transition-colors ${
                  role === r ? "bg-red-500 text-white" : "bg-white text-gray-700"
                }`}
                disabled={loading}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && <p className="text-red-500 text-center mt-2">{error}</p>}

        {/* Signup */}
        <button
          onClick={handleSignup}
          disabled={loading}
          className={`mt-6 w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-colors ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? <ClipLoader size={20} color="#fff" /> : "Sign Up"}
        </button>

        {/* Google Signup */}
        <button
          onClick={handleGoogleAuth}
          disabled={loading}
          className={`mt-4 w-full border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <FcGoogle size={20} />
          <span>{loading ? "Processing..." : "Sign up with Google"}</span>
        </button>

        {/* Signin link */}
        <p className="text-center mt-2 cursor-pointer" onClick={() => navigate("/signin")}>
          Already have an account? <span className="text-red-500">Sign in</span>
        </p>
      </div>
    </div>
  );
};

export default Signup;
