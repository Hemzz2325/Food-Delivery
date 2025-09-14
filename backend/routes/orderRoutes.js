// backend/routes/orderRoutes.js
import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { 
  createOrder, 
  verifyPayment, 
  getCurrentOrder, 
  getUserOrders 
} from "../controllers/orderController.js";

const orderRouter = express.Router();

// Create order
orderRouter.post("/create", isAuth, createOrder);

// Verify payment
orderRouter.post("/verify-payment", isAuth, verifyPayment);

// Get current order (for tracking)
orderRouter.get("/current", isAuth, getCurrentOrder);

// Get user orders
orderRouter.get("/user-orders", isAuth, getUserOrders);

export default orderRouter;