// routes/authRoutes.js
import express from "express";
import { 
  googleAuth, 
  resetPassword, 
  sendOtp, 
  signIn, 
  signOut, 
  signUp, 
  verifyOtp 
} from "../controllers/authController.js";

const authRouter = express.Router();

// ✅ FIXED - Simple relative paths
authRouter.post("/signup", signUp);
authRouter.post("/signin", signIn);
authRouter.post("/signout", signOut);
authRouter.post("/send-otp", sendOtp);
authRouter.post("/verify-otp", verifyOtp);
authRouter.post("/reset-password", resetPassword);
authRouter.post("/google-auth", googleAuth);

authRouter.stack.forEach((layer) => {
  if (layer.route) {
    console.log("📌 Auth Route:", Object.keys(layer.route.methods), layer.route.path);
  }
});

export default authRouter;