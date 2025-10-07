// backend/controllers/orderController.js - FIXED VERSION
import crypto from "crypto";
import Razorpay from "razorpay";
import mongoose from "mongoose";

// Models (keep your existing model paths/names)
import Order from "../models/orderModel.js";
import User from "../models/usermodel.js";
import Shop from "../models/shopModel.js";
import Item from "../models/itemModel.js";

// Utils
import { sendOtpMail } from "../utils/mail.js";

// ---------- Razorpay bootstrap ----------
let razorpayInstance = null;
function initRazorpay() {
  const key_id = process.env.RAZORPAY_KEY_ID || "";
  const key_secret = process.env.RAZORPAY_KEY_SECRET || "";
  if (!key_id || !key_secret) return null;
  try {
    return new Razorpay({ key_id, key_secret });
  } catch {
    return null;
  }
}
razorpayInstance = initRazorpay();

const toPaise = (inr) => Math.round(Number(inr || 0) * 100);
const sixDigitOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// ---------- Create Order (ONLINE) ----------
export const createOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const { items, totalAmount, deliveryAddress } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items are required" });
    }
    if (!totalAmount || Number(totalAmount) <= 0) {
      return res.status(400).json({ message: "Valid total amount required" });
    }
    if (!razorpayInstance) {
      return res.status(503).json({
        message: "Payment service unavailable. Try COD.",
      });
    }

    // Create Razorpay order
    const rzpOrder = await razorpayInstance.orders.create({
      amount: toPaise(totalAmount),
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: { userId: String(userId), itemCount: String(items.length) },
      payment_capture: 1,
    });

    // Persist app order as pending
    const orderDoc = await Order.create({
      user: userId,
      items: items.map((it) => ({
        item: it.itemId,
        quantity: Number(it.quantity),
        price: Number(it.price),
      })),
      totalAmount: Number(totalAmount),
      deliveryAddress: deliveryAddress || {},
      status: "pending",
      paymentMethod: "ONLINE",
      razorpayOrderId: rzpOrder.id,
    });

    // Return what the frontend needs; key is not required on client if fetched server-side,
    // but returning it is harmless. Prefer using VITE_RAZORPAY_KEY_ID on client if set.
    return res.status(201).json({
      success: true,
      order: orderDoc,
      id: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      key: process.env.RAZORPAY_KEY_ID || undefined,
    });
  } catch (e) {
    return res.status(502).json({
      message: "Payment gateway error. Please try again or use COD.",
      error: e?.message,
    });
  }
};

// ---------- Verify Payment (ONLINE) ----------
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body || {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment details" });
    }
    const secret = process.env.RAZORPAY_KEY_SECRET || "";
    if (!secret) {
      return res.status(503).json({ message: "Verification unavailable" });
    }

    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const orderDoc = await Order.findOne({
      razorpayOrderId: razorpay_order_id,
      user: req.userId,
    });
    if (!orderDoc) {
      return res.status(404).json({ message: "Order not found" });
    }

    orderDoc.razorpayPaymentId = razorpay_payment_id;
    orderDoc.razorpaySignature = razorpay_signature;
    orderDoc.status = "paid";
    orderDoc.paidAt = new Date();
    await orderDoc.save();

    return res.json({
      success: true,
      message: "Payment verified successfully",
      order: orderDoc,
    });
  } catch (e) {
    return res
      .status(500)
      .json({ message: "Payment verification failed", error: e?.message });
  }
};

// ---------- Create Order (COD) ----------
export const createCodOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const { items, totalAmount, deliveryAddress } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items are required" });
    }
    if (!totalAmount || Number(totalAmount) <= 0) {
      return res.status(400).json({ message: "Valid total amount required" });
    }

    const orderDoc = await Order.create({
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

    return res.status(201).json({
      success: true,
      message: "COD order placed successfully",
      order: orderDoc,
    });
  } catch (e) {
    return res
      .status(500)
      .json({ message: "Failed to place COD order", error: e?.message });
  }
};

// ---------- User: Get Current Order ----------
export const getCurrentOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const order = await Order.findOne({ user: userId })
      .sort({ createdAt: -1 })
      .populate("items.item", "name image price category foodtype")
      .lean();

    const cleaned =
      order && order.items
        ? { ...order, items: order.items.filter((it) => it?.item) }
        : order || null;

    return res.json({ order: cleaned });
  } catch {
    return res.status(500).json({ message: "Failed to fetch current order" });
  }
};

// ---------- User: List My Orders ----------
export const listMyOrders = async (req, res) => {
  try {
    const userId = req.userId;
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("items.item", "name image price category foodtype")
      .populate("deliveryBoy", "fullName mobile")
      .lean();

    const cleaned = (orders || []).map((o) => ({
      ...o,
      items: (o.items || []).filter((it) => it?.item),
    }));
    return res.json({ orders: cleaned });
  } catch {
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
};

// ---------- User: Get Order by ID ----------
export const getOrderById = async (req, res) => {
  try {
    const userId = req.userId;
    const { orderId } = req.params;
    const order = await Order.findOne({ _id: orderId, user: userId })
      .populate("items.item", "name image price category foodtype")
      .populate("deliveryBoy", "fullName mobile")
      .lean();
    if (!order) return res.status(404).json({ message: "Order not found" });
    return res.json({ order });
  } catch {
    return res.status(500).json({ message: "Failed to fetch order" });
  }
};

// ---------- Owner: List Orders ----------
export const listOwnerOrders = async (req, res) => {
  try {
    const ownerId = req.userId;
    const shop = await Shop.findOne({ owner: ownerId }).select("_id items");
    if (!shop || !shop.items?.length) return res.json({ orders: [] });

    const orders = await Order.find({ "items.item": { $in: shop.items } })
      .sort({ createdAt: -1 })
      .populate("items.item", "name image price category foodtype")
      .populate("user", "fullName mobile email")
      .populate("deliveryBoy", "fullName email mobile role")
      .lean();

    return res.json({ orders });
  } catch {
    return res.status(500).json({ message: "Failed to fetch owner orders" });
  }
};

// ---------- Owner: Update Order Status ----------
export const updateOrderStatusByOwner = async (req, res) => {
  try {
    const ownerId = req.userId;
    const { orderId } = req.params;
    const { status, estimatedDeliveryTime } = req.body || {};

    const allowed = new Set(["confirmed", "preparing", "out_for_delivery", "cancelled"]);
    if (!allowed.has(status)) {
      return res.status(400).json({ message: "Invalid status for owner update" });
    }

    const shop = await Shop.findOne({ owner: ownerId }).select("items");
    if (!shop) return res.status(403).json({ message: "No shop found for owner" });

    const order = await Order.findOne({ _id: orderId, "items.item": { $in: shop.items } });
    if (!order) return res.status(404).json({ message: "Order not found for this owner" });

    order.status = status;
    if (estimatedDeliveryTime) order.estimatedDeliveryTime = new Date(estimatedDeliveryTime);
    await order.save();

    return res.json({ message: "Status updated", order });
  } catch {
    return res.status(500).json({ message: "Failed to update status" });
  }
};

// ---------- Owner: Assign Delivery ----------
export const assignDelivery = async (req, res) => {
  try {
    const ownerId = req.userId;
    const { orderId } = req.params;
    const { deliveryBoyId, deliveryBoyEmail } = req.body || {};

    const shop = await Shop.findOne({ owner: ownerId }).select("items");
    if (!shop) return res.status(403).json({ message: "No shop found for owner" });

    const order = await Order.findOne({ _id: orderId, "items.item": { $in: shop.items } });
    if (!order) return res.status(404).json({ message: "Order not found for this owner" });

    let deliveryUser = null;
    if (deliveryBoyId) deliveryUser = await User.findById(deliveryBoyId).select("_id role email fullName");
    else if (deliveryBoyEmail) deliveryUser = await User.findOne({ email: deliveryBoyEmail }).select("_id role email fullName");
    else return res.status(400).json({ message: "Provide deliveryBoyId or deliveryBoyEmail" });

    if (!deliveryUser) return res.status(404).json({ message: "Delivery user not found" });
    if (deliveryUser.role !== "delivery boy") return res.status(400).json({ message: "User is not a delivery partner" });

    order.deliveryBoy = deliveryUser._id;
    if (order.status === "paid") order.status = "confirmed";
    await order.save();

    return res.json({ message: "Delivery assigned", order });
  } catch {
    return res.status(500).json({ message: "Failed to assign delivery" });
  }
};

// ---------- Delivery: Accept ----------
export const deliveryAccept = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select("role");
    if (!user || user.role !== "delivery boy") return res.status(403).json({ message: "Forbidden" });

    const { orderId } = req.params;
    const order = await Order.findOne({ _id: orderId, deliveryBoy: userId });
    if (!order) return res.status(404).json({ message: "Order not found or not assigned" });

    if (new Set(["delivered", "cancelled"]).has(order.status)) {
      return res.status(400).json({ message: `Cannot accept in '${order.status}' state` });
    }

    order.status = "out_for_delivery";
    await order.save();
    return res.json({ message: "Order accepted", order });
  } catch {
    return res.status(500).json({ message: "Failed to accept order" });
  }
};

// ---------- Delivery: List ----------
export const listDeliveryOrders = async (req, res) => {
  try {
    const userId = req.userId;
    const orders = await Order.find({ deliveryBoy: userId })
      .sort({ createdAt: -1 })
      .populate("items.item", "name image price category foodtype")
      .populate("user", "fullName mobile email")
      .lean();
    return res.json({ orders });
  } catch {
    return res.status(500).json({ message: "Failed to fetch delivery orders" });
  }
};

// ---------- Delivery: Send OTP ----------
export const sendDeliveryOtp = async (req, res) => {
  try {
    const userId = req.userId;
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate("user", "email fullName");
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (!order.deliveryBoy || String(order.deliveryBoy) !== String(userId)) {
      return res.status(403).json({ message: "Not authorized to send OTP" });
    }
    if (!["out_for_delivery", "preparing", "confirmed"].includes(order.status)) {
      return res.status(400).json({ message: `Cannot send OTP in '${order.status}' state` });
    }

    const otp = sixDigitOtp();
    order.deliveryOtp = otp;
    order.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await order.save();

    if (order.user?.email) {
      const subject = "Country Kitchen Delivery OTP";
      const text = `Your delivery OTP is ${otp}. It expires in 10 minutes.`;
      const html = `<p>Hello ${order.user?.fullName || ""},</p><p>Your delivery OTP is <b>${otp}</b>. It expires in 10 minutes.</p>`;
      await sendOtpMail(order.user.email, subject, text, html);
    }

    return res.json({ message: "OTP sent to customer email" });
  } catch {
    return res.status(500).json({ message: "Failed to send OTP" });
  }
};

// ---------- Delivery: Verify OTP ----------
export const verifyDeliveryOtp = async (req, res) => {
  try {
    const userId = req.userId;
    const { orderId } = req.params;
    const { otp } = req.body || {};
    if (!otp) return res.status(400).json({ message: "OTP is required" });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (!order.deliveryBoy || String(order.deliveryBoy) !== String(userId)) {
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

    return res.json({ message: "Order delivered", order });
  } catch {
    return res.status(500).json({ message: "Failed to verify OTP" });
  }
};

// ---------- Owner: Pending Count ----------
export const getOwnerPendingCount = async (req, res) => {
  try {
    const ownerId = new mongoose.Types.ObjectId(req.userId);
    const shops = await Shop.find({ owner: ownerId }, { _id: 1 });
    const shopIds = shops.map((s) => s._id);
    if (!shopIds.length) return res.json({ count: 0 });

    const items = await Item.find({ shop: { $in: shopIds } }, { _id: 1 });
    const itemIds = items.map((i) => i._id);
    if (!itemIds.length) return res.json({ count: 0 });

    const pipeline = [
      { $match: { status: { $nin: ["delivered", "cancelled"] } } },
      { $unwind: "$items" },
      { $match: { "items.item": { $in: itemIds } } },
      { $group: { _id: "$_id" } },
      { $count: "count" },
    ];
    const result = await Order.aggregate(pipeline);
    const count = result?.[0]?.count || 0;
    return res.json({ count });
  } catch {
    return res.status(500).json({ message: "Failed to get pending count" });
  }
};

// ---------- Clear Current Cart ----------
export const clearCurrentCart = async (req, res) => {
  try {
    const userId = req.userId;
    const order = await Order.findOne({
      user: userId,
      status: { $in: ["pending", "cod_pending"] },
    }).sort({ createdAt: -1 });
    if (order) await Order.deleteOne({ _id: order._id });
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ message: "Failed to clear cart" });
  }
};

// ---------- Owner: Get Order by ID ----------
export const getOwnerOrderById = async (req, res) => {
  try {
    const ownerId = req.userId;
    const { orderId } = req.params;

    const shop = await Shop.findOne({ owner: ownerId }).select("items");
    if (!shop) return res.status(403).json({ message: "No shop found for owner" });

    const order = await Order.findOne({
      _id: orderId,
      "items.item": { $in: shop.items },
    })
      .populate("items.item", "name image price category foodtype")
      .populate("user", "fullName mobile email")
      .populate("deliveryBoy", "fullName mobile");
    if (!order) return res.status(404).json({ message: "Order not found for this owner" });

    return res.json({ order });
  } catch {
    return res.status(500).json({ message: "Failed to fetch owner order" });
  }
};
