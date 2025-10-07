// backend/controllers/orderController.js - FIXED VERSION
import crypto from "crypto";
import Razorpay from "razorpay";
import Order from "../models/orderModel.js";
import User from "../models/usermodel.js";
import Shop from "../models/shopModel.js";
import Item from "../models/itemModel.js";
import { sendOtpMail } from "../utils/mail.js";
import mongoose from "mongoose";

// Initialize Razorpay instance once at startup
let razorpayInstance = null;

function initializeRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  
  console.log("🔍 Razorpay Configuration Check:");
  console.log("- Key ID present:", !!keyId);
  console.log("- Key Secret present:", !!keySecret);
  console.log("- Key ID value:", keyId ? `${keyId.substring(0, 8)}...` : "MISSING");
  
  if (!keyId || !keySecret) {
    console.error("❌ CRITICAL: Razorpay keys missing in environment variables");
    console.error("- RAZORPAY_KEY_ID:", keyId || "NOT SET");
    console.error("- RAZORPAY_KEY_SECRET:", keySecret ? "SET" : "NOT SET");
    return null;
  }
  
  try {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    console.log("✅ Razorpay initialized successfully");
    return razorpayInstance;
  } catch (error) {
    console.error("❌ Razorpay initialization failed:", error.message);
    return null;
  }
}

// Initialize on module load
const razorpay = initializeRazorpay();

const makeOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Create Order (Online Payment)
export const createOrder = async (req, res) => {
  try {
    const { items, totalAmount, deliveryAddress } = req.body;
    const userId = req.userId;

    console.log("📦 Creating order:", { userId, itemCount: items?.length, totalAmount });

    // Validate inputs
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items are required" });
    }

    if (!totalAmount || Number(totalAmount) <= 0) {
      return res.status(400).json({ message: "Valid total amount required" });
    }

    // Check if Razorpay is initialized
    if (!razorpay) {
      console.error("❌ Razorpay not initialized - check environment variables");
      return res.status(503).json({ 
        message: "Payment service unavailable. Please contact support or try COD.",
        error: "Razorpay configuration missing",
        useCodeInstead: true
      });
    }

    // Create Razorpay order
    const amountInPaise = Math.round(Number(totalAmount) * 100);
    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: { 
        userId: userId.toString(),
        itemCount: items.length 
      },
    };

    console.log("💳 Creating Razorpay order with options:", JSON.stringify(options, null, 2));
    
    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create(options);
      console.log("✅ Razorpay order created:", razorpayOrder.id);
    } catch (rzpError) {
      console.error("❌ Razorpay order creation failed:", rzpError);
      return res.status(502).json({
        message: "Payment gateway error. Please try again or use COD.",
        error: rzpError.message,
        useCodeInstead: true
      });
    }

    // Create order in database
    const order = new Order({
      user: userId,
      items: items.map((item) => ({ 
        item: item.itemId, 
        quantity: Number(item.quantity), 
        price: Number(item.price) 
      })),
      totalAmount: Number(totalAmount),
      razorpayOrderId: razorpayOrder.id,
      deliveryAddress: deliveryAddress || {},
      status: "pending",
      paymentMethod: "ONLINE",
    });

    await order.save();
    console.log("✅ Order saved to database:", order._id);

    // Return complete response for frontend
    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: order,
      // Razorpay details for checkout
      id: razorpayOrder.id,
      currency: razorpayOrder.currency,
      amount: razorpayOrder.amount,
    });
  } catch (error) {
    console.error("❌ Create order error:", error);
    return res.status(500).json({ 
      message: "Failed to create order", 
      error: error.message 
    });
  }
};

// Verify Payment
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    console.log("🔐 Verifying payment:", { razorpay_order_id, razorpay_payment_id });

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment details" });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      console.error("❌ CRITICAL: RAZORPAY_KEY_SECRET not found during verification");
      return res.status(503).json({ message: "Payment verification unavailable" });
    }

    // Generate signature and verify
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const generated_signature = crypto
      .createHmac("sha256", keySecret)
      .update(body)
      .digest("hex");

    console.log("🔐 Signature comparison:");
    console.log("- Received:", razorpay_signature);
    console.log("- Generated:", generated_signature);

    if (generated_signature !== razorpay_signature) {
      console.error("❌ Signature mismatch - payment verification failed");
      return res.status(400).json({ message: "Payment verification failed" });
    }

    // Update order
    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    if (!order) {
      console.error("❌ Order not found:", razorpay_order_id);
      return res.status(404).json({ message: "Order not found" });
    }

    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.status = "paid";
    order.paidAt = new Date();
    await order.save();

    console.log("✅ Payment verified successfully for order:", order._id);

    return res.status(200).json({ 
      success: true,
      message: "Payment verified successfully", 
      order 
    });
  } catch (error) {
    console.error("❌ Verify payment error:", error);
    return res.status(500).json({ 
      message: "Payment verification failed", 
      error: error.message 
    });
  }
};

// Create COD Order (rest of the code remains the same)
export const createCodOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const { items, totalAmount, deliveryAddress } = req.body;

    console.log("💵 Creating COD order:", { userId, itemCount: items?.length, totalAmount });

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items are required" });
    }

    if (!totalAmount || Number(totalAmount) <= 0) {
      return res.status(400).json({ message: "Valid total amount required" });
    }

    const order = new Order({
      user: userId,
      items: items.map((it) => ({
        item: it.itemId,
        quantity: Number(it.quantity),
        price: Number(it.price),
      })),
      totalAmount: Number(totalAmount),
      deliveryAddress: deliveryAddress || {},
      status: "cod_pending",
      paymentMethod: "COD",
    });

    await order.save();
    console.log("✅ COD order created:", order._id);

    return res.status(201).json({ 
      success: true,
      message: "COD order placed successfully", 
      order 
    });
  } catch (error) {
    console.error("❌ Create COD order error:", error);
    return res.status(500).json({ 
      message: "Failed to place COD order", 
      error: error.message 
    });
  }
};

// ... (rest of the existing functions remain unchanged)
// Get Current Order
export const getCurrentOrder = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const order = await Order.findOne({ user: userId })
      .sort({ createdAt: -1 })
      .populate("items.item", "name image price category foodtype")
      .lean();

    const cleanedOrder = order
      ? { ...order, items: (order.items || []).filter(it => it?.item) }
      : null;

    return res.status(200).json({ order: cleanedOrder });
  } catch (error) {
    console.error("❌ Get current order error:", error);
    return res.status(500).json({ message: "Failed to fetch current order" });
  }
};

// List My Orders
export const listMyOrders = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("items.item", "name image price category foodtype")
      .populate("deliveryBoy", "fullName mobile")
      .lean();

    const cleaned = orders.map(o => ({
      ...o,
      items: (o.items || []).filter(it => it?.item)
    }));

    return res.status(200).json({ orders: cleaned });
  } catch (error) {
    console.error("❌ List my orders error:", error);
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
};

// Get Order By ID
export const getOrderById = async (req, res) => {
  try {
    const userId = req.userId;
    const { orderId } = req.params;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const order = await Order.findOne({ _id: orderId, user: userId })
      .populate("items.item", "name image price category foodtype")
      .populate("deliveryBoy", "fullName mobile")
      .lean();

    if (!order) return res.status(404).json({ message: "Order not found" });

    return res.status(200).json({ order });
  } catch (error) {
    console.error("❌ Get order error:", error);
    return res.status(500).json({ message: "Failed to fetch order" });
  }
};

// Owner: List Orders
export const listOwnerOrders = async (req, res) => {
  try {
    const ownerId = req.userId;
    if (!ownerId) return res.status(401).json({ message: "Unauthorized" });

    const shop = await Shop.findOne({ owner: ownerId }).select("_id items");
    if (!shop) return res.status(200).json({ orders: [] });

    const itemIds = shop.items || [];
    if (!itemIds.length) return res.status(200).json({ orders: [] });

    const orders = await Order.find({ "items.item": { $in: itemIds } })
      .sort({ createdAt: -1 })
      .populate("items.item", "name image price category foodtype")
      .populate("user", "fullName mobile email")
      .populate("deliveryBoy", "fullName email mobile role")
      .lean();

    return res.status(200).json({ orders });
  } catch (error) {
    console.error("❌ List owner orders error:", error);
    return res.status(500).json({ message: "Failed to fetch owner orders" });
  }
};

// Owner: Update Order Status
export const updateOrderStatusByOwner = async (req, res) => {
  try {
    const ownerId = req.userId;
    const { orderId } = req.params;
    const { status, estimatedDeliveryTime } = req.body;

    if (!ownerId) return res.status(401).json({ message: "Unauthorized" });

    const allowed = new Set(["confirmed", "preparing", "out_for_delivery", "cancelled"]);
    if (!allowed.has(status)) {
      return res.status(400).json({ message: "Invalid status for owner update" });
    }

    const shop = await Shop.findOne({ owner: ownerId }).select("items");
    if (!shop) return res.status(403).json({ message: "No shop found for owner" });

    const order = await Order.findOne({ _id: orderId, "items.item": { $in: shop.items } });
    if (!order) return res.status(404).json({ message: "Order not found for this owner" });

    order.status = status;
    if (estimatedDeliveryTime) {
      order.estimatedDeliveryTime = new Date(estimatedDeliveryTime);
    }
    await order.save();

    return res.status(200).json({ message: "Status updated", order });
  } catch (error) {
    console.error("❌ Update order status error:", error);
    return res.status(500).json({ message: "Failed to update status" });
  }
};

// Owner: Assign Delivery
export const assignDelivery = async (req, res) => {
  try {
    const ownerId = req.userId;
    const { orderId } = req.params;
    const { deliveryBoyId, deliveryBoyEmail } = req.body;

    if (!ownerId) return res.status(401).json({ message: "Unauthorized" });

    const shop = await Shop.findOne({ owner: ownerId }).select("items");
    if (!shop) return res.status(403).json({ message: "No shop found for owner" });

    const order = await Order.findOne({ _id: orderId, "items.item": { $in: shop.items } });
    if (!order) return res.status(404).json({ message: "Order not found for this owner" });

    let deliveryUser = null;
    if (deliveryBoyId) {
      deliveryUser = await User.findById(deliveryBoyId).select("_id role email fullName");
    } else if (deliveryBoyEmail) {
      deliveryUser = await User.findOne({ email: deliveryBoyEmail }).select("_id role email fullName");
    } else {
      return res.status(400).json({ message: "Provide deliveryBoyId or deliveryBoyEmail" });
    }

    if (!deliveryUser) return res.status(404).json({ message: "Delivery user not found" });
    if (deliveryUser.role !== "delivery boy") {
      return res.status(400).json({ message: "User is not a delivery partner" });
    }

    order.deliveryBoy = deliveryUser._id;
    if (order.status === "paid") order.status = "confirmed";
    await order.save();

    return res.status(200).json({ message: "Delivery assigned", order });
  } catch (error) {
    console.error("❌ Assign delivery error:", error);
    return res.status(500).json({ message: "Failed to assign delivery" });
  }
};

// Delivery: Accept Order
export const deliveryAccept = async (req, res) => {
  try {
    const userId = req.userId;
    const { orderId } = req.params;

    const user = await User.findById(userId).select("role");
    if (!user || user.role !== "delivery boy") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const order = await Order.findOne({ _id: orderId, deliveryBoy: userId });
    if (!order) return res.status(404).json({ message: "Order not found or not assigned" });

    const terminal = new Set(["delivered", "cancelled"]);
    if (terminal.has(order.status)) {
      return res.status(400).json({ message: `Cannot accept in '${order.status}' state` });
    }

    order.status = "out_for_delivery";
    await order.save();

    return res.status(200).json({ message: "Order accepted", order });
  } catch (error) {
    console.error("❌ Delivery accept error:", error);
    return res.status(500).json({ message: "Failed to accept order" });
  }
};

// Delivery: List Orders
export const listDeliveryOrders = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const orders = await Order.find({ deliveryBoy: userId })
      .sort({ createdAt: -1 })
      .populate("items.item", "name image price category foodtype")
      .populate("user", "fullName mobile email")
      .lean();

    return res.status(200).json({ orders });
  } catch (error) {
    console.error("❌ List delivery orders error:", error);
    return res.status(500).json({ message: "Failed to fetch delivery orders" });
  }
};

// Delivery: Send OTP
export const sendDeliveryOtp = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId;

    const order = await Order.findById(orderId).populate("user", "email fullName");
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (!order.deliveryBoy || order.deliveryBoy.toString() !== String(userId)) {
      return res.status(403).json({ message: "Not authorized to send OTP" });
    }

    if (!["out_for_delivery", "preparing", "confirmed"].includes(order.status)) {
      return res.status(400).json({ message: `Cannot send OTP in '${order.status}' state` });
    }

    const otp = makeOtp();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    order.deliveryOtp = otp;
    order.otpExpiry = expires;
    await order.save();

    const to = order.user?.email;
    if (to) {
      const subject = "Country Kitchen Delivery OTP";
      const text = `Your delivery OTP is ${otp}. It expires in 10 minutes.`;
      const html = `<p>Hello ${order.user?.fullName || ""},</p><p>Your delivery OTP is <b>${otp}</b>. It expires in 10 minutes.</p>`;
      await sendOtpMail(to, subject, text, html);
    }

    return res.status(200).json({ message: "OTP sent to customer email" });
  } catch (error) {
    console.error("❌ Send delivery OTP error:", error);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
};

// Delivery: Verify OTP
export const verifyDeliveryOtp = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { otp } = req.body;
    const userId = req.userId;

    if (!otp) return res.status(400).json({ message: "OTP is required" });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (!order.deliveryBoy || order.deliveryBoy.toString() !== String(userId)) {
      return res.status(403).json({ message: "Not authorized to verify OTP" });
    }

    if (!order.deliveryOtp || !order.otpExpiry) {
      return res.status(400).json({ message: "No OTP generated for this order" });
    }

    if (new Date() > new Date(order.otpExpiry)) {
      return res.status(400).json({ message: "OTP expired. Please resend" });
    }

    if (String(order.deliveryOtp) !== String(otp)) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    order.deliveryOtp = undefined;
    order.otpExpiry = undefined;
    order.status = "delivered";
    order.deliveredAt = new Date();
    await order.save();

    return res.status(200).json({ message: "Order delivered", order });
  } catch (error) {
    console.error("❌ Verify delivery OTP error:", error);
    return res.status(500).json({ message: "Failed to verify OTP" });
  }
};

// Owner: Get Pending Count
export const getOwnerPendingCount = async (req, res) => {
  try {
    const ownerId = new mongoose.Types.ObjectId(req.userId);
    const shops = await Shop.find({ owner: ownerId }, { _id: 1 });
    const shopIds = shops.map(s => s._id);
    if (!shopIds.length) return res.json({ count: 0 });

    const items = await Item.find({ shop: { $in: shopIds } }, { _id: 1 });
    const itemIds = items.map(i => i._id);
    if (!itemIds.length) return res.json({ count: 0 });

    const pipeline = [
      { $match: { status: { $nin: ["delivered", "cancelled"] } } },
      { $unwind: "$items" },
      { $match: { "items.item": { $in: itemIds } } },
      { $group: { _id: "$_id" } },
      { $count: "count" }
    ];
    const result = await Order.aggregate(pipeline);
    const count = result?.[0]?.count || 0;
    
    return res.json({ count });
  } catch (error) {
    console.error("❌ Get pending count error:", error);
    return res.status(500).json({ message: "Failed to get pending count" });
  }
};

// Clear Current Cart
export const clearCurrentCart = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const order = await Order.findOne({ 
      user: userId, 
      status: { $in: ["pending", "cod_pending"] } 
    }).sort({ createdAt: -1 });

    if (order) {
      await Order.deleteOne({ _id: order._id });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("❌ Clear cart error:", error);
    return res.status(500).json({ message: "Failed to clear cart" });
  }
};

// Owner: Get Order By ID
export const getOwnerOrderById = async (req, res) => {
  try {
    const ownerId = req.userId;
    const { orderId } = req.params;

    const shop = await Shop.findOne({ owner: ownerId }).select("items");
    if (!shop) return res.status(403).json({ message: "No shop found for owner" });

    const order = await Order.findOne({ _id: orderId, "items.item": { $in: shop.items } })
      .populate("items.item", "name image price category foodtype")
      .populate("user", "fullName mobile email")
      .populate("deliveryBoy", "fullName mobile");

    if (!order) return res.status(404).json({ message: "Order not found for this owner" });

    return res.status(200).json({ order });
  } catch (error) {
    console.error("❌ Get owner order error:", error);
    return res.status(500).json({ message: "Failed to fetch owner order" });
  }
};
