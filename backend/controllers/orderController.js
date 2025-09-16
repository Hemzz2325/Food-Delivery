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
    const { items, totalAmount, deliveryAddress } = req.body;
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
      amount: totalAmount * 100, // amount in paise
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
      deliveryAddress,
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

// Verify Payment
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment details" });
    }

    // Generate signature and verify
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.status = "paid";
    order.paidAt = new Date();

    await order.save();

    res.json({ message: "Payment verified successfully", order });
  } catch (err) {
    console.error("verifyPayment error:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

// Get Current Order (latest order for user)
export const getCurrentOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ user: req.userId })
      .sort({ createdAt: -1 })
      .populate("items.item");

    if (!order) return res.status(404).json({ message: "No orders found" });

    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch current order", error: err.message });
  }
};

// Get all orders for the user
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId })
      .populate("items.item")
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders", error: err.message });
  }
};
