// models/userModel.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    mobile: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "owner", "delivery boy"],
      required: true,
    },
    city: { type: String },
    state: { type: String },
    address: { type: String },

    resetOtp: { type: String }, // For storing OTP for password reset
    isOtpVerified: { type: Boolean, default: false },
    otpExpiry: { type: Date },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;