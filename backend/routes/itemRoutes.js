import express from "express";
import isAuth from "../middlewares/isAuth.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

// Temporary item controller functions
const addItem = async (req, res) => {
  res.status(201).json({ message: "Item added", item: req.body });
};

const editItem = async (req, res) => {
  res.json({ message: "Item updated", item: req.body });
};

const getItemById = async (req, res) => {
  res.json({ item: null });
};

const deleteItem = async (req, res) => {
  res.json({ message: "Item deleted" });
};

const getItemByCity = async (req, res) => {
  res.json({ items: [] });
};

router.post("/add-item", isAuth, upload.single("image"), addItem);
router.put("/edit-item/:itemId", isAuth, upload.single("image"), editItem);
router.get("/get-by-id/:itemId", isAuth, getItemById);
router.delete("/delete/:itemId", isAuth, deleteItem);
router.get("/city/:city", getItemByCity);

export default router;