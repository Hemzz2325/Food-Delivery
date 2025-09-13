// routes/itemRoutes.js
import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { addItem, editItem } from "../controllers/itemcontroller.js";
import upload from "../middlewares/multer.js";

const itemRouter = express.Router();

// Add item
itemRouter.post("/add-item", isAuth, upload.single("image"), addItem);

// Edit item (POST or PUT, POST works but PUT is more RESTful)
itemRouter.put("/edit-item/:itemId", isAuth, upload.single("image"), editItem);

export default itemRouter;
