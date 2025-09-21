// backend/controllers/orderController.js
import crypto from "crypto";
import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
import Shop from "../models/shopModel.js";
import Item from "../models/itemModel.js";
import { sendOtpMail } from "../utils/mail.js";

let razorpay = null;
const makeOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

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

    return res.status(200).json({ order });
  } catch (err) {
    console.error("getCurrentOrder error:", err);
    return res.status(500).json({ message: "Failed to fetch current order" });
  }
};


// Get all orders for the user
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId })
      .populate("items.item")
      .sort({ createdAt: -1 });
    return res.json({ orders });
  } catch (err) {
    if (err?.name === "CastError") {
      const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 });
      return res.json({ orders });
    }
    return res.status(500).json({ message: "Failed to fetch orders", error: err.message });
  }
};


export const listMyOrders = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("items.item", "name image price category foodtype")
      .lean();
    const cleaned = orders.map(o => ({
      ...o,
      items: (o.items || []).filter(it => it?.item),
    }));
    return res.status(200).json({ orders: cleaned });

    return res.status(200).json({ orders });
  } catch (err) {
    console.error("listMyOrders error:", err);
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
};



export const getOrderById = async (req, res) => {
  try {
    const userId = req.userId;
    const { orderId } = req.params;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const order = await Order.findOne({ _id: orderId, user: userId })
      .populate("items.item", "name image price category foodtype")
      .lean();

    if (!order) return res.status(404).json({ message: "Order not found" });
    return res.status(200).json({ order });
  } catch (err) {
    console.error("getOrderById error:", err);
    return res.status(500).json({ message: "Failed to fetch order" });
  }
};



//// my perplexity

// Helper: ensure role
const ensureRole = async (userId, role) => {
  const u = await User.findById(userId).select("role");
  return u && u.role === role;
};

// Owner: list orders that include items from the owner's shop
export const listOwnerOrders = async (req, res) => {
  try {
    const ownerId = req.userId;
    if (!ownerId) return res.status(401).json({ message: "Unauthorized" });

    // Find the owner's shop and its items
    const shop = await Shop.findOne({ owner: ownerId }).select("_id items");
    if (!shop) return res.status(200).json({ orders: [] });

    const itemIds = shop.items || [];
    if (!itemIds.length) return res.status(200).json({ orders: [] });

    // Any order that contains at least one item from this shop
    const orders = await Order.find({ "items.item": { $in: itemIds } })
      .sort({ createdAt: -1 })
      .populate("items.item", "name image price category foodtype")
      .populate("deliveryBoy", "fullName email mobile role")
      .lean();

    return res.status(200).json({ orders });
  } catch (err) {
    console.error("listOwnerOrders error:", err);
    return res.status(500).json({ message: "Failed to fetch owner orders" });
  }
};

// Owner: update order status (allowed: confirmed, preparing, out_for_delivery, cancelled)
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

    // Ensure this order belongs to the owner's shop via any item
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
  } catch (err) {
    console.error("updateOrderStatusByOwner error:", err);
    return res.status(500).json({ message: "Failed to update status" });
  }
};

// Owner: assign delivery partner by id or email
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
    if (deliveryUser.role !== "delivery boy") return res.status(400).json({ message: "User is not a delivery partner" });

    order.deliveryBoy = deliveryUser._id;
    // Optionally move to confirmed if still pending
    if (order.status === "paid") order.status = "confirmed";
    await order.save();

    return res.status(200).json({ message: "Delivery assigned", order });
  } catch (err) {
    console.error("assignDelivery error:", err);
    return res.status(500).json({ message: "Failed to assign delivery" });
  }
};

// Delivery: accept assigned order (server-only for now; UI comes in Stage 4)
export const deliveryAccept = async (req, res) => {
  try {
    const userId = req.userId;
    const { orderId } = req.params;

    // Must be delivery role
    const ok = await ensureRole(userId, "delivery boy");
    if (!ok) return res.status(403).json({ message: "Forbidden" });

    const order = await Order.findOne({ _id: orderId, deliveryBoy: userId });
    if (!order) return res.status(404).json({ message: "Order not found or not assigned" });

    // Move to out_for_delivery if not yet delivered/cancelled
    const terminal = new Set(["delivered", "cancelled"]);
    if (terminal.has(order.status)) {
      return res.status(400).json({ message: `Cannot accept in '${order.status}' state` });
    }

    order.status = "out_for_delivery";
    await order.save();

    return res.status(200).json({ message: "Order accepted", order });
  } catch (err) {
    console.error("deliveryAccept error:", err);
    return res.status(500).json({ message: "Failed to accept order" });
  }
};

// Delivery: list orders assigned to current delivery partner
export const listDeliveryOrders = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const orders = await Order.find({ deliveryBoy: userId })
      .sort({ createdAt: -1 })
      .populate("items.item", "name image price category foodtype")
      .lean();

    return res.status(200).json({ orders });
  } catch (err) {
    console.error("listDeliveryOrders error:", err);
    return res.status(500).json({ message: "Failed to fetch delivery orders" });
  }
};

/**
 * POST /api/order/delivery/send-otp/:orderId
 * Only the assigned delivery partner can trigger sending the OTP to the customer email.
 */
export const sendDeliveryOtp = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId;

    const order = await Order.findById(orderId).populate("user", "email fullName");
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Must be the assigned delivery partner
    if (!order.deliveryBoy || order.deliveryBoy.toString() !== String(userId)) {
      return res.status(403).json({ message: "Not authorized to send OTP" });
    }

    // Only allow when the order is on the way
    if (order.status !== "out_for_delivery" && order.status !== "preparing" && order.status !== "confirmed") {
      return res.status(400).json({ message: `Cannot send OTP in '${order.status}' state` });
    }

    const otp = makeOtp();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    order.deliveryOtp = otp;
    order.otpExpiry = expires;
    await order.save();

    // Email the OTP to the customer (uses the same mail utility as auth OTP)
    const to = order.user?.email;
    if (to) {
      const subject = "Country Kitchen Delivery OTP";
      const text = `Your delivery OTP is ${otp}. It expires in 10 minutes.`;
      const html = `<p>Hello ${order.user?.fullName || ""},</p><p>Your delivery OTP is <b>${otp}</b>. It expires in 10 minutes.</p>`;
      await sendOtpMail(to, subject, text, html);
    }

    return res.status(200).json({ message: "OTP sent to customer email" });
  } catch (err) {
    console.error("sendDeliveryOtp error:", err);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
};

/**
 * POST /api/order/delivery/verify-otp/:orderId
 * Only the assigned delivery partner can verify the OTP and mark delivered.
 * Body: { otp: "123456" }
 */
export const verifyDeliveryOtp = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { otp } = req.body;
    const userId = req.userId;

    if (!otp) return res.status(400).json({ message: "OTP is required" });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Must be the assigned delivery partner
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

    // Success: clear OTP and mark delivered
    order.deliveryOtp = undefined;
    order.otpExpiry = undefined;
    order.status = "delivered";
    order.deliveredAt = new Date();
    await order.save();

    return res.status(200).json({ message: "Order delivered", order });
  } catch (err) {
    console.error("verifyDeliveryOtp error:", err);
    return res.status(500).json({ message: "Failed to verify OTP" });
  }
};


