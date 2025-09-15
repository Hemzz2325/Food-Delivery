// routes/itemRoutes.js
import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { addItem, deleteItem, editItem, getItemByCity, getItemById } from "../controllers/itemController.js";
import upload from "../middlewares/multer.js";

const itemRouter = express.Router();

// ✅ CORRECT - Proper parameter names
itemRouter.post("/add-item", isAuth, upload.single("image"), addItem);
itemRouter.put("/edit-item/:itemId", isAuth, upload.single("image"), editItem);
itemRouter.get("/get-by-id/:itemId", isAuth, getItemById);
itemRouter.delete("/delete/:itemId", isAuth, deleteItem);
itemRouter.get("/get-by-city/:city", getItemByCity); // ✅ Proper parameter name

export default itemRouter;