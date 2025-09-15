// backend/controllers/orderController.js
// backend/controllers/orderController.js
import crypto from "crypto";
import Order from "../models/orderModel.js";

let razorpay = null;

try {
  const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;

  if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
    const Razorpay = (await import("razorpay")).default;
    razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });
    console.log("✅ Razorpay initialized successfully");
  } else {
    console.warn(
      "⚠️ Razorpay keys missing in environment variables. Payment features will be disabled."
    );
  }
} catch (error) {
  razorpay = null;
  console.error("❌ Failed to initialize Razorpay:", error.message);
}

// ----------------- CONTROLLERS -----------------

// Create Order
export const createOrder = async (req, res) => {
  try {
    const { items, totalAmount } = req.body;
    const userId = req.userId;

    if (!items || !totalAmount) {
      return res.status(400).json({ message: "Items and total amount are required" });
    }

    if (!razorpay) {
      return res
        .status(503)
        .json({ message: "Payment gateway not configured. Orders cannot be created." });
    }

    const options = {
      amount: totalAmount * 100,
      currency: "INR",
      receipt: `order_${Date.now()}`,
      notes: { userId, itemCount: items.length },
    };

    const razorpayOrder = await razorpay.orders.create(options);

    const order = new Order({
      user: userId,
      items: items.map((item) => ({
        item: item.itemId,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount,
      razorpayOrderId: razorpayOrder.id,
      status: "pending",
    });

    await order.save();

    res.status(201).json({
      id: razorpayOrder.id,
      currency: razorpayOrder.currency,
      amount: razorpayOrder.amount,
      order,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create order", error: error.message });
  }
};

// Rest of controllers remain unchanged...

// Verify Payment
export const verifyPayment = async (req, res) => {
  res.json({ message: "verifyPayment stub" });
};

// Get Current Order
export const getCurrentOrder = async (req, res) => {
  res.json({ message: "getCurrentOrder stub" });
};

// Get User Orders
export const getUserOrders = async (req, res) => {
  res.json({ message: "getUserOrders stub" });
};
