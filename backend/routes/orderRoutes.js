



import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
    createOrder,
    verifyPayment,
    getCurrentOrder,
    getUserOrders
} from "../controllers/orderController.js";

const orderRouter = express.Router();

orderRouter.post("/create", isAuth, createOrder);
orderRouter.post("/verify-payment", isAuth, verifyPayment);
orderRouter.get("/current", isAuth, getCurrentOrder);
orderRouter.get("/user-orders", isAuth, getUserOrders);

export default orderRouter;
