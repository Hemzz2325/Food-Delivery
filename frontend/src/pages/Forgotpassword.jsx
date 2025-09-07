import React, { useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ClipLoader } from "react-spinners";

const Forgotpassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const serverUrl = import.meta.env.VITE_SERVER_URL;

  const handleSendOtp = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/send-otp`,
        { email },
        { withCredentials: true }
      );
      console.log(result.data);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
      console.log(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/verify-otp`,
        { email, otp },
        { withCredentials: true }
      );
      console.log(result.data);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed");
      console.log(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/reset-password`,
        { email, newPassword },
        { withCredentials: true }
      );
      console.log(result.data);
      navigate("/signin");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
      console.log(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-rose-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8">
        <div className="flex items-center mb-6 gap-4">
          <IoIosArrowBack
            className="text-[#ff4d2d] cursor-pointer"
            size={30}
            onClick={() => step > 1 && setStep(step - 1)}
          />
          <h1 className="text-2xl font-bold text-red-500">Forgot Password</h1>
        </div>

        {/* Display error */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* Step 1: Enter Email */}
        {step === 1 && (
          <div>
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
            <button
              onClick={handleSendOtp}
              disabled={loading}
              className={`mt-6 w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-colors ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </div>
        )}

        {/* Step 2: Enter OTP */}
        {step === 2 && (
          <div>
            <label htmlFor="otp" className="block text-gray-700 font-medium mb-1">
              Enter OTP
            </label>
            <input
              type="text"
              id="otp"
              className="w-full border rounded-lg px-3 py-3 focus:outline-none focus:border-red-600 border-neutral-300"
              placeholder="Enter the OTP sent to your email"
              value={otp}
              required
              onChange={(e) => setOtp(e.target.value)}
            />
            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className={`mt-6 w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-colors ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </div>
        )}

        {/* Step 3: Reset Password */}
        {step === 3 && (
          <div>
            <label htmlFor="password" className="block text-gray-700 font-medium mb-1">
              New Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full border rounded-lg px-3 py-3 mb-4 focus:outline-none focus:border-red-600 border-neutral-300"
              placeholder="Enter new password"
              value={newPassword}
              required
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="w-full border rounded-lg px-3 py-3 focus:outline-none focus:border-red-600 border-neutral-300"
              placeholder="Confirm password"
              value={confirmPassword}
              required
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button
              onClick={handleResetPassword}
              disabled={loading}
              className={`mt-6 w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-colors ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
             {loading ? <ClipLoader size={20} color="#ffffff" /> : "Sign Up"}
            </button>

            <p className="mt-4 text-center text-sm text-gray-600">
              Remembered your password?{" "}
              <Link to="/signin" className="text-red-500 font-semibold hover:underline">
                Go back to Sign In
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Forgotpassword;
