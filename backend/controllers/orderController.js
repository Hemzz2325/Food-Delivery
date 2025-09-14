// backend/controllers/orderController.js
import crypto from "crypto";
import Order from "../models/orderModel.js";

// Initialize Razorpay only if keys are provided
let razorpay = null;

try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    const Razorpay = (await import("razorpay")).default;
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    console.log("✅ Razorpay initialized successfully");
  } else {
    console.warn("⚠️  Razorpay keys not found in environment variables");
    console.warn("   Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your .env file");
  }
} catch (error) {
  console.error("❌ Failed to initialize Razorpay:", error.message);
}

/**
 * Create Order
 *//**
 * Create Order
 */
export const createOrder = async (req, res) => {
  try {
    const { items, totalAmount } = req.body;   // ⬅️ removed currency
    const userId = req.userId;

    if (!items || !totalAmount) {
      return res.status(400).json({ message: "Items and total amount are required" });
    }

    // Check if Razorpay is initialized
    if (!razorpay) {
      return res.status(500).json({ 
        message: "Payment gateway not configured. Please contact administrator.",
        error: "Razorpay keys not found"
      });
    }

    // Always enforce INR
    const options = {
      amount: totalAmount * 100, // paise
      currency: "INR",           // 🔒 force INR
      receipt: `order_${Date.now()}`,
      notes: {
        userId: userId,
        itemCount: items.length
      }
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Create order in database
    const order = new Order({
      user: userId,
      items: items.map(item => ({
        item: item.itemId,
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount,
      razorpayOrderId: razorpayOrder.id,
      status: "pending",
    });

    await order.save();
    console.log(`✅ Order created: ${order._id} for user: ${userId}`);

    res.status(201).json({
      id: razorpayOrder.id,
      currency: razorpayOrder.currency,
      amount: razorpayOrder.amount,
      order: order
    });
  } catch (error) {
    console.error("❌ Create order error:", error);
    res.status(500).json({ message: "Failed to create order", error: error.message });
  }
};
