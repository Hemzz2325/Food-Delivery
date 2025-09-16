// routes/shopRoutes.js - FIXED
import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { createAndEditShop, getMyShop, getShopByCity } from "../controllers/shopController.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.post("/", isAuth, upload.single("image"), createAndEditShop); // Simplified
router.get("/my", isAuth, getMyShop); // Simplified
router.get("/city/:city", getShopByCity); // Clean parameter

export default router;