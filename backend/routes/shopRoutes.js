import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { createandeditShop, getMyShop } from "../controllers/shopController.js";
import upload from "../middlewares/multer.js";


const shopRouter= express.Router()
// Define user-related routes here, e.g. profile, update, delete, etc.

shopRouter.post("/create-edit", isAuth, upload.single("image"), createandeditShop);
shopRouter.get("/get-my", isAuth, getMyShop);


export default shopRouter