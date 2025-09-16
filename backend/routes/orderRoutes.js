

// backend/routes/orderRoutes.js
import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { createOrder, verifyPayment } from "../controllers/orderController.js";

const router = express.Router();

// Create order
router.post("/create", isAuth, createOrder);

// Verify payment
router.post("/verify-payment", isAuth, verifyPayment);

export default router;
