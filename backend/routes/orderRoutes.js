import express from "express";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

const createOrder = async (req, res) => {
  res.json({ message: "Order created" });
};

router.post("/create", isAuth, createOrder);

export default router;