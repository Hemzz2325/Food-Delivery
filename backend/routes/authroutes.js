// routes/authRoutes.js - Completely clean version
import express from "express";
import { 
  googleAuth, 
  resetPassword, 
  sendOtp, 
  signIn, 
  signOut, 
  signUp, 
  verifyOtp 
} from "../controllers/authcontroller.js";

const router = express.Router();

router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/signout", signOut);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
router.post("/google-auth", googleAuth);

 

export default router;