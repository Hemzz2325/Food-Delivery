import User from "../models/usermodel.js";
import bcrypt from "bcryptjs";
import { genToken } from "../utils/token.js";
import { sendOtpMail } from "../utils/mail.js";

// SIGN IN
export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (!user.password) return res.status(400).json({ message: "User has no local password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = genToken(user._id);
    res.cookie("token", token, { secure: true, httpOnly: true, sameSite: "none", maxAge: 7 * 24 * 3600 * 1000 });

    return res.status(200).json({
      message: "User signed in successfully",
      token,
      user: { id: user._id, email: user.email, fullName: user.fullName, role: user.role, mobile: user.mobile }
    });
  } catch (error) {
    console.error("Signin error:", error, error.stack);
    return res.status(500).json({ message: "Signin error", error: error.message });
  }
};


// SEND OTP
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not present" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
    user.isOtpVerified = false;
    await user.save();

    await sendOtpMail(
      email,
      "Your OTP for Password Reset",
      `Your OTP is ${otp}. It is valid for 5 minutes.`,
      `<b>Your OTP is ${otp}. It is valid for 5 minutes.</b>`
    );

    return res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("OTP error:", error, error.stack);
    return res.status(500).json({ message: "Error in sending OTP", error: error.message });
  }
};

// GOOGLE AUTH
export const googleAuth = async (req, res) => {
  try {
    const { email, fullName } = req.body;
    console.log("googleAuth body:", req.body);
    if (!email) return res.status(400).json({ message: "Email required" });

    let user = await User.findOne({ email });
    if (!user) {
      const mobile = req.body.mobile && req.body.mobile.trim() ? req.body.mobile : "unknown";
      const role = req.body.role || "user";
      user = await User.create({ fullName, email, password: "", role, mobile });
    }

    const token = genToken(user._id);
    res.cookie("token", token, { secure:true, httpOnly: true, sameSite: "none", maxAge: 7 * 24 * 3600 * 1000 });

  return res.status(200).json({ message: "Google Auth successful", token, user: { id: user._id, email: user.email, fullName: user.fullName, role: user.role, mobile: user.mobile } });
  } catch (error) {
  console.error("Google Auth error:", error, error.stack);
  return res.status(500).json({ message: "Google Auth error", error: error.message });
  }
};

// SIGN UP
export const signUp = async (req, res) => {
  try {
    const { fullName, email, password, mobile, role } = req.body;
    if (!fullName || !email || !password || !mobile) return res.status(400).json({ message: "All fields are required" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await User.create({ fullName, email, password: hashed, mobile, role: role || "user" });

    const token = genToken(newUser._id);
    res.cookie("token", token, { secure:true, httpOnly: true, sameSite: "none", maxAge: 7 * 24 * 3600 * 1000 });

  return res.status(201).json({ message: "User created", token, user: { id: newUser._id, email: newUser.email, fullName: newUser.fullName, role: newUser.role, mobile: newUser.mobile } });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Signup error", error: error.message });
  }
};

// SIGN OUT
export const signOut = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "Signed out" });
  } catch (error) {
    console.error("Signout error:", error);
    return res.status(500).json({ message: "Signout error", error: error.message });
  }
};

// VERIFY OTP
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not present" });

    if (!user.resetOtp || user.resetOtp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (user.otpExpiry && user.otpExpiry < Date.now()) return res.status(400).json({ message: "OTP expired" });

    user.isOtpVerified = true;
    user.resetOtp = undefined;
    await user.save();

    return res.status(200).json({ message: "OTP verified" });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({ message: "Verify OTP error", error: error.message });
  }
};

// RESET PASSWORD should be folleewd
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) return res.status(400).json({ message: "Email and new password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not present" });

    if (!user.isOtpVerified) return res.status(400).json({ message: "OTP not verified" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.isOtpVerified = false;
    user.otpExpiry = undefined;
    await user.save();

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset Password error:", error);
    return res.status(500).json({ message: "Reset Password error", error: error.message });
  }
};
