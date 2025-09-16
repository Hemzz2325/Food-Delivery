// routes/userRoutes.js
import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { getCurrentUser, updateLocation } from "../controllers/userController.js";

const userRouter = express.Router();

// ✅ FIXED - Simple relative paths
userRouter.get("/current", isAuth, getCurrentUser);
userRouter.post("/update-location", isAuth, updateLocation);

export default userRouter;