

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
    verifyDeliveryOtp
} from "../controllers/orderController.js";

const router = express.Router();

// Create order
router.post("/create", isAuth, createOrder);

// Verify payment
router.post("/verify-payment", isAuth, verifyPayment);


router.get("/my-orders", isAuth, listMyOrders);

// Get latest/current order
router.get("/current", isAuth, getCurrentOrder);

// Get order by id (keep last to avoid path clashes)
router.get("/:orderId", isAuth, getOrderById);

//owner endpoints
router.get("/owner/my", isAuth, listOwnerOrders);
router.patch("/owner/status/:orderId", isAuth, updateOrderStatusByOwner);
router.patch("/owner/assign/:orderId", isAuth, assignDelivery);


// Delivery endpoint (server ready; UI comes in Stage 4)
router.patch("/delivery/accept/:orderId", isAuth, deliveryAccept);

// Delivery: list my assigned orders
router.get("/delivery/my", isAuth, listDeliveryOrders);



// Stage 5: delivery OTP endpoints
router.post("/delivery/send-otp/:orderId", isAuth, sendDeliveryOtp);
router.post("/delivery/verify-otp/:orderId", isAuth, verifyDeliveryOtp);

export default router;
