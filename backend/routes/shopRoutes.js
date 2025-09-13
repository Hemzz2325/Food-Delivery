// routes/shopRoutes.js
import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { createAndEditShop, getMyShop, getShopByCity } from "../controllers/shopController.js";
import upload from "../middlewares/multer.js";

const shopRouter = express.Router();

shopRouter.post("/create-edit", isAuth, upload.single("image"), createAndEditShop);
shopRouter.get("/get-myShop", isAuth, getMyShop);
shopRouter.get("/get-by-city/:city", getShopByCity);

export default shopRouter;
