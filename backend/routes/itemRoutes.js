// routes/itemRoutes.js
import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { addItem, deleteItem, editItem, getItemByCity, getItemById } from "../controllers/itemController.js";
import upload from "../middlewares/multer.js";

const itemRouter = express.Router();

// Add item
itemRouter.post("/add-item", isAuth, upload.single("image"), addItem);

// Edit item
itemRouter.put("/edit-item/:itemId", isAuth, upload.single("image"), editItem);

// Get by id
itemRouter.get("/get-by-id/:itemId", isAuth, getItemById);

// Delete
itemRouter.delete("/delete/:itemId", isAuth, deleteItem);

// Get by city
itemRouter.get("/get-by-city/:city", getItemByCity);

export default itemRouter;
