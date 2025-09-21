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

  const testBackendConnection = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/signin`, {
        timeout: 5000,
        withCredentials: true,
      });
      return true;
    } catch (err) {
      if (err.response?.status === 404) return true;
      return false;
    }
  };

  const routeByRole = (user) => {
    const role = String(user?.role || "").toLowerCase();
    if (role === "owner") navigate("/owner/orders");
    else if (role === "delivery boy") navigate("/delivery");
    else navigate("/");
  };

  // Email/password
  const handleSignIn = async (e) => {
    e?.preventDefault?.();
    setError("");
    setLoading(true);
    try {
      const ok = await testBackendConnection();
      if (!ok) throw new Error("Backend not reachable");

      const res = await axios.post(
        `${serverUrl}/api/auth/signin`,
        { email, password },
        {
          withCredentials: true,
          timeout: 10000,
          headers: { "Content-Type": "application/json" },
        }
      );

      const { token, user } = res.data || {};
      if (token) localStorage.setItem("authToken", token);
      if (user) dispatch(setUserData(user));

      routeByRole(user);
      // inside Signin.jsx after dispatch(setUserData(user))
      const role = String(user?.role || "").toLowerCase();
      if (role === "owner") navigate("/owner/orders");
      else if (role === "delivery boy") navigate("/delivery");
      else navigate("/");

    } catch (err) {
      let msg = "Signin failed. Please try again.";
      if (err.code === "ECONNREFUSED")
        msg = "Cannot connect to server. Start backend on port 8000.";
      else if (err.code === "ENOTFOUND") msg = "Server not found.";
      else if (err.response?.status === 404) msg = "Signin route not found.";
      else if (err.response?.status === 500) msg = "Server error. Try later.";
      else if (err.response?.data?.message) msg = err.response.data.message;
      else if (err.response?.data?.error) msg = err.response.data.error;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Google
  const handleGoogleAuth = async () => {
    setError("");
    setLoading(true);
    try {
      const ok = await testBackendConnection();
      if (!ok) throw new Error("Backend not reachable");

      const g = await signInWithPopup(auth, provider);
      const payload = {
        fullName: g?.user?.displayName || "",
        email: g?.user?.email || "",
      };

      const res = await axios.post(`${serverUrl}/api/auth/google-auth`, payload, {
        withCredentials: true,
        timeout: 10000,
        headers: { "Content-Type": "application/json" },
      });

      const { token, user } = res.data || {};
      if (token) localStorage.setItem("authToken", token);
      if (user) dispatch(setUserData(user));

      routeByRole(user);
    } catch (err) {
      let msg = "Google Auth failed. Try again.";
      if (err.code === "ECONNREFUSED")
        msg = "Cannot connect to server. Start backend on port 8000.";
      else if (err.response?.data?.message) msg = err.response.data.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-rose-50">
      <div className="max-w-md w-full p-6 rounded-lg shadow-lg bg-white border border-gray-300">
        <h1 className="text-3xl font-bold mb-2 text-red-500">Country-Kitchen</h1>
        <p className="text-gray-500">Sign in to continue enjoying tasty food</p>

        <div className="mt-2 text-xs text-gray-500">Backend: {serverUrl}</div>

        <form onSubmit={handleSignIn}>
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

          <div
            className="text-right mb-4 text-red-500 cursor-pointer"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot Password
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-2 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`mt-6 w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-colors ${loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
          >
            {loading ? <ClipLoader size={20} color="#fff" /> : "Sign In"}
          </button>
        </form>

        <button
          onClick={handleGoogleAuth}
          disabled={loading}
          className={`mt-4 w-full border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
        >
          <FcGoogle size={20} />
          <span>{loading ? "Processing..." : "Sign in with Google"}</span>
        </button>

        <p className="text-center mt-2 cursor-pointer" onClick={() => navigate("/signup")}>
          Don’t have an account? <span className="text-red-500">Sign up</span>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
