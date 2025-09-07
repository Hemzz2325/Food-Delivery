import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import axios from "axios";
import { serverUrl } from "../config.js";
import { useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase"; // ✅ make sure this path is correct
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

  // Handle normal signup
  const handleSignup = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(
        `${serverUrl}/api/auth/signup`,
        { fullName, email, password, mobile, role },
        { withCredentials: true }
      );

      const { token, user } = res.data;

  // Save token in localStorage
  localStorage.setItem("authToken", token);

      // Save user info in Redux
      dispatch(setUserData(user));

      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Handle Google authentication
  const handleGoogleAuth = async () => {
    setError("");
    if (!mobile) return setError("Mobile number is required for Google signup");

    const provider = new GoogleAuthProvider();
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const res = await axios.post(
        `${serverUrl}/api/auth/google-auth`,
        {
          fullName: result.user.displayName,
          email: result.user.email,
          mobile, // ✅ include mobile for new user
          role,
        },
        { withCredentials: true }
      );

      const { token, user } = res.data;

  // Save token in localStorage
  localStorage.setItem("authToken", token);

      // Save user info in Redux
      dispatch(setUserData(user));

      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Google Auth failed");
      console.log("Google Auth Error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-rose-50">
      <div className="max-w-md w-full p-6 rounded-lg shadow-lg bg-white border border-gray-300">
        <h1 className="text-3xl font-bold mb-2 text-red-500">Country-Kitchen</h1>
        <p className="text-gray-500">Create Your Account To enjoy Tasty Food</p>

        {/* Full Name */}
        <div className="mt-4">
          <label htmlFor="fullName" className="block text-gray-700 font-medium mb-1">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            className="w-full border rounded-lg px-3 py-3 focus:outline-none focus:border-red-600 border-neutral-300"
            placeholder="Enter your Full Name"
            value={fullName}
            required
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        {/* Email */}
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

        {/* Mobile */}
        <div className="mt-4">
          <label htmlFor="mobile" className="block text-gray-700 font-medium mb-1">
            Mobile Number
          </label>
          <input
            type="text"
            id="mobile"
            className="w-full border rounded-lg px-3 py-3 focus:outline-none focus:border-red-600 border-neutral-300"
            placeholder="Enter your Mobile number"
            value={mobile}
            required
            onChange={(e) => setMobile(e.target.value)}
          />
        </div>

        {/* Password */}
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

        {/* Role Selector */}
        <div className="mt-4">
          <label className="block text-gray-700 font-medium mb-1">Role</label>
          <div className="flex gap-2">
            {["user", "owner", "delivery boy"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 border cursor-pointer rounded-lg px-3 py-2 text-center font-medium transition-colors 
                ${role === r ? "bg-red-500 text-white" : "bg-white text-gray-700"}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && <p className="text-red-500 text-center mt-2">{error}</p>}

        {/* Signup Button */}
        <button
          className={`mt-6 w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-colors cursor-pointer ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={handleSignup}
          disabled={loading}
        >
          {loading ? <ClipLoader size={20} color="#ffffff" /> : "Sign Up"}
        </button>

        {/* Google Signup Button */}
        <button
          onClick={handleGoogleAuth}
          className={`mt-4 w-full border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={loading}
        >
          <FcGoogle size={20} />
          <span>{loading ? "Processing..." : "Sign up with Google"}</span>
        </button>

        {/* Signin Link */}
        <p
          className="text-center mt-2 cursor-pointer"
          onClick={() => navigate("/signin")}
        >
          Already have an Account ? <span className="text-red-500">Sign in</span>
        </p>
      </div>
    </div>
  );
};

export default Signup;
