import React, { useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { motion, AnimatePresence } from "framer-motion";

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
      await axios.post(`${serverUrl}/api/auth/send-otp`, { email }, { withCredentials: true });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    setLoading(true);
    try {
      await axios.post(`${serverUrl}/api/auth/verify-otp`, { email, otp }, { withCredentials: true });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed");
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
      await axios.post(`${serverUrl}/api/auth/reset-password`, { email, newPassword }, { withCredentials: true });
      navigate("/signin");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white p-6">
      <div className="flex flex-col md:flex-row items-center gap-10 max-w-5xl w-full">
        {/* Left Illustration */}
        <motion.img
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          src="/password.png"
          alt="Forgot password illustration"
          className="w-64 md:w-80 object-contain drop-shadow-lg"
        />

        {/* Right Form Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative bg-white/90 backdrop-blur-xl border border-red-100 
                     rounded-2xl shadow-[0_8px_30px_rgba(239,35,60,0.3)] 
                     w-full max-w-md p-8"
        >
          {/* Header */}
          <div className="flex items-center mb-6 gap-4">
            {step > 1 && (
              <motion.div
                whileTap={{ scale: 0.85 }}
                className="p-2 rounded-full bg-red-100 cursor-pointer hover:bg-red-200"
                onClick={() => setStep(step - 1)}
              >
                <IoIosArrowBack className="text-[#EF233C]" size={24} />
              </motion.div>
            )}
            <h1 className="text-2xl font-extrabold text-[#EF233C] tracking-tight">
              Forgot Password
            </h1>
          </div>

          {/* Error Message */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-center mb-4 font-medium"
            >
              {error}
            </motion.p>
          )}

          {/* Steps */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.4 }}
              >
                <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full border rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#EF233C] border-neutral-300"
                  placeholder="Enter your Email"
                  value={email}
                  required
                  onChange={(e) => setEmail(e.target.value)}
                />
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSendOtp}
                  disabled={loading}
                  className={`mt-6 w-full bg-[#EF233C] hover:bg-red-600 text-white font-semibold py-3 rounded-xl shadow-lg transition-all ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? "Sending..." : "Send OTP"}
                </motion.button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.4 }}
              >
                <label htmlFor="otp" className="block text-gray-700 font-medium mb-1">
                  Enter OTP
                </label>
                <input
                  type="text"
                  id="otp"
                  className="w-full border rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#EF233C] border-neutral-300"
                  placeholder="Enter the OTP sent to your email"
                  value={otp}
                  required
                  onChange={(e) => setOtp(e.target.value)}
                />
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleVerifyOtp}
                  disabled={loading}
                  className={`mt-6 w-full bg-[#EF233C] hover:bg-red-600 text-white font-semibold py-3 rounded-xl shadow-lg transition-all ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </motion.button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.4 }}
              >
                <label htmlFor="password" className="block text-gray-700 font-medium mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="w-full border rounded-lg px-3 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-[#EF233C] border-neutral-300"
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
                  className="w-full border rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#EF233C] border-neutral-300"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  required
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleResetPassword}
                  disabled={loading}
                  className={`mt-6 w-full bg-[#EF233C] hover:bg-red-600 text-white font-semibold py-3 rounded-xl shadow-lg transition-all ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? <ClipLoader size={20} color="#ffffff" /> : "Reset Password"}
                </motion.button>

                <p className="mt-4 text-center text-sm text-gray-600">
                  Remembered your password?{" "}
                  <Link to="/signin" className="text-[#EF233C] font-semibold hover:underline">
                    Go back to Sign In
                  </Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default Forgotpassword;
