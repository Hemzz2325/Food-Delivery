// src/pages/Signup.jsx
import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import axios from "axios";
import { serverUrl } from "../config.js";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../firebase";
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

      const roleName = String(user?.role || "").toLowerCase();
      if (roleName === "owner") navigate("/owner/orders");
      else if (roleName === "delivery boy") navigate("/delivery");
      else navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

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
      setError(err?.response?.data?.message || "Google signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background */}
      <img
        src="/signin_img.png"
        alt="background"
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
      />
      <div className="absolute inset-0 " />

      {/* Right-side Form */}
<div className="relative min-h-screen w-full flex items-center justify-start px-6">
  <div
    className="max-w-md w-full px-6 py-6 rounded-2xl shadow-2xl
    backdrop-blur-sm  border border-white/90
    animate-[slideIn_0.6s_ease-out] flex flex-col gap-3 min-h-[580px]"
  >
    <h1 className="text-2xl font-bold text-red-500">Country-Kitchen</h1>
    <p className="text-gray-700 text-sm">Create your account</p>

    {/* Inputs */}
    <input
      type="text"
      placeholder="Full Name"
      className="w-full border rounded-lg px-3 py-3 text-sm bg-white text-gray-800 focus:outline-none focus:border-red-600 border-neutral-300"
      value={fullName}
      onChange={(e) => setFullName(e.target.value)}
      disabled={loading}
    />
    <input
      type="email"
      placeholder="E-mail"
      className="w-full border rounded-lg px-3 py-3 text-sm bg-white text-gray-800 focus:outline-none focus:border-red-600 border-neutral-300"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      disabled={loading}
    />
    <input
      type="text"
      placeholder="Mobile Number"
      className="w-full border rounded-lg px-3 py-3 text-sm bg-white text-gray-800 focus:outline-none focus:border-red-600 border-neutral-300"
      value={mobile}
      onChange={(e) => setMobile(e.target.value)}
      disabled={loading}
    />
    <input
      type="password"
      placeholder="Password"
      className="w-full border rounded-lg px-3 py-3 text-sm bg-white text-gray-800 focus:outline-none focus:border-red-600 border-neutral-300"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      disabled={loading}
    />

    {/* Role */}
    <div className="flex gap-2 mt-1">
      {["user", "owner", "delivery boy"].map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => setRole(r)}
          className={`flex-1 border rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            role === r ? "bg-red-500 text-white" : "bg-white text-gray-800 border-neutral-300"
          }`}
          disabled={loading}
        >
          {r}
        </button>
      ))}
    </div>

    {/* Error */}
    {error && <p className="text-red-600 text-sm text-center">{error}</p>}

    {/* Signup */}
    <button
      onClick={handleSignup}
      disabled={loading}
      className={`mt-1 w-full bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-3 rounded-lg transition-transform hover:scale-[1.02] ${
        loading ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {loading ? <ClipLoader size={16} color="#fff" /> : "Sign Up"}
    </button>

    {/* Google Signup */}
    <button
      onClick={handleGoogleAuth}
      disabled={loading}
         className={`
              mt-4 w-full py-3 rounded-lg 
              border border-gray-300 
              bg-white/10 
              text-white 
              font-semibold 
              flex items-center justify-center gap-2 
              transition-transform duration-200 
              hover:scale-105 
              shadow-sm
              ${loading ? "opacity-50 cursor-not-allowed" : ""}
            `}
    >
      <FcGoogle size={18} />
      <span>{loading ? "Processing..." : "Sign up with Google"}</span>
    </button>

    {/* Signin link */}
    <p
      className="text-center mt-1 text-sm cursor-pointer text-gray-800"
      onClick={() => navigate("/signin")}
    >
      Already have an account? <span className="text-red-500">Sign in</span>
    </p>
  </div>
</div>

    </div>
  );
};

export default Signup;
