// routes/shopRoutes.js - COMPLETELY FIXED VERSION
import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { createAndEditShop, getMyShop, getShopByCity } from "../controllers/shopController.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

// Create/Edit shop route - matches frontend POST to /api/shop/create-edit
router.post("/create-edit", isAuth, upload.single("image"), createAndEditShop);

// Get my shop
router.get("/my", isAuth, getMyShop);

// Get shops by city
router.get("/city/:city", getShopByCity);

export default router;