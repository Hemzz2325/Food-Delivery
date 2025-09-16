// routes/userRoutes.js
import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { getCurrentUser, updateLocation } from "../controllers/userController.js";

const userRouter = express.Router();

// ✅ FIXED - Simple relative paths
userRouter.get("/current", isAuth, getCurrentUser);
userRouter.post("/update-location", isAuth, updateLocation);


userRouter.stack.forEach((layer) => {
  if (layer.route) {
    console.log("📌 Auth Route:", Object.keys(layer.route.methods), layer.route.path);
  }
});

export default userRouter;