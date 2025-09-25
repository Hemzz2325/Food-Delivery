// backend/routes/orderRoutes.js
import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  createOrder,
  verifyPayment,
  listMyOrders,
  getCurrentOrder,
  getOrderById,
  listOwnerOrders,
  updateOrderStatusByOwner,
  assignDelivery,
  deliveryAccept,
  listDeliveryOrders,
  sendDeliveryOtp,
  verifyDeliveryOtp,
  getOwnerPendingCount,
  createCodOrder,
  clearCurrentCart,
  getOwnerOrderById,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/create", isAuth, createOrder);
router.post("/verify-payment", isAuth, verifyPayment);
router.get("/my-orders", isAuth, listMyOrders);
router.get("/current", isAuth, getCurrentOrder);

// owner/delivery
router.get("/owner/my", isAuth, listOwnerOrders);
router.patch("/owner/status/:orderId", isAuth, updateOrderStatusByOwner);
router.patch("/owner/assign/:orderId", isAuth, assignDelivery);
router.patch("/delivery/accept/:orderId", isAuth, deliveryAccept);
router.get("/delivery/my", isAuth, listDeliveryOrders);
router.post("/delivery/send-otp/:orderId", isAuth, sendDeliveryOtp);
router.post("/delivery/verify-otp/:orderId", isAuth, verifyDeliveryOtp);

// metrics
router.get("/owner/pending-count", isAuth, getOwnerPendingCount);

// cart cleanup
router.post("/clear-current", isAuth, clearCurrentCart);

// owner tracking fetch
router.get("/owner/order/:orderId", isAuth, getOwnerOrderById);

// COD
router.post("/cod", isAuth, createCodOrder);

// customer fetch by id (keep last)
router.get("/:orderId", isAuth, getOrderById);

export default router;
