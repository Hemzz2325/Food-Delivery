// routes/orderRoutes.js
import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
    createOrder,
    verifyPayment,
    getCurrentOrder,
    getUserOrders
} from "../controllers/orderController.js";

const orderRouter = express.Router();

// ✅ FIXED - All routes use simple relative paths
orderRouter.post("/create", isAuth, createOrder);
orderRouter.post("/verify-payment", isAuth, verifyPayment);
orderRouter.get("/current", isAuth, getCurrentOrder);
orderRouter.get("/user-orders", isAuth, getUserOrders);
orderRouter.stack.forEach((layer) => {
  if (layer.route) {
    console.log("📌 Auth Route:", Object.keys(layer.route.methods), layer.route.path);
  }
});

export default orderRouter;