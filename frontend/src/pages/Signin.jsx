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
    } catch (err) {
      let msg = "Signin failed. Please try again.";
      if (err.code === "ECONNREFUSED") msg = "Cannot connect to server.";
      else if (err.code === "ENOTFOUND") msg = "Server not found.";
      else if (err.response?.data?.message) msg = err.response.data.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

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
      if (err.response?.data?.message) msg = err.response.data.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Fullscreen Background */}
      <img
        src="/signin_img.png"
        alt="background"
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
      />
      {/* Optional overlay for contrast */}
      <div className="absolute inset-0 " />

      {/* Right-side Form */}
      <div className="relative min-h-screen w-full flex items-center justify-start px-10">
        <div
          className="
            max-w-sm w-full px-6 py-6 
            rounded-2xl 
            bg-white/0 
            backdrop-blur-sm
            border border-white/30 
            shadow-lg 
            animate-[slideIn_0.6s_ease-out]
          "
        >
          <h1 className="text-3xl font-extrabold mb-2 text-red-500 drop-shadow">
            Country-Kitchen
          </h1>
          <p className="text-gray-200 mb-4">Sign in to continue enjoying tasty food</p>

          {/* <div className="mt-2 text-xs text-gray-300">Backend: {serverUrl}</div> */}

          {/* Sign-in form */}
          <form onSubmit={handleSignIn} className="space-y-4 mt-4">
            <div>
              <label className="block text-gray-200 font-medium mb-1 px-32 ">E-Mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="
                  w-full 
                  border border-gray-300 
                  rounded-lg 
                  px-4 py-3 
                  bg-white/20 
                  text-white 
                  placeholder-gray-200 
                  focus:outline-none 
                  focus:ring-2 focus:ring-red-500 
                  backdrop-blur-md
                "
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-gray-200 font-medium mb-1 px-30">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="
                  w-full 
                  border border-gray-300 
                  rounded-lg 
                  px-4 py-3 
                  bg-white/20 
                  text-white 
                  placeholder-gray-200 
                  focus:outline-none 
                  focus:ring-2 focus:ring-red-500 
                  backdrop-blur-md
                "
                placeholder="Enter your password"
              />
            </div>

            <div
              className="text-right text-red-300 cursor-pointer text-sm"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot Password?
            </div>

            {error && (
              <div className="bg-red-100/50 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`
                w-full 
                py-3 
                rounded-lg 
                bg-red-500/80 
                hover:bg-red-600/90 
                text-white 
                font-semibold 
                transition-transform duration-200 
                hover:scale-105 
                shadow-lg 
                ${loading ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              {loading ? <ClipLoader size={20} color="#fff" /> : "Sign In"}
            </button>
          </form>

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
            <FcGoogle size={20} />
            <span>{loading ? "Processing..." : "Sign in with Google"}</span>
          </button>

          <p
            className="text-center mt-4 text-gray-200 cursor-pointer"
            onClick={() => navigate("/signup")}
          >
            Don’t have an account?{" "}
            <span className="text-red-500 font-semibold">Sign up</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
