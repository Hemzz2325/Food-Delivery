// routes/itemRoutes.js
import express from "express";
import isAuth from "../middlewares/isAuth.js";
import upload from "../middlewares/multer.js";
import { rateItem } from "../controllers/itemRatingController.js";
import { 
  addItem, 
  editItem, 
  getItemById, 
  deleteItem, 
  getItemByCity 
} from "../controllers/itemcontroller.js";

const router = express.Router();

// Add item
router.post("/add-item", isAuth, upload.single("image"), addItem);

// Edit item
router.put("/edit-item/:itemId", isAuth, upload.single("image"), editItem);

// Get item by ID
router.get("/get-by-id/:itemId", isAuth, getItemById);

// Delete item
router.delete("/delete/:itemId", isAuth, deleteItem);

// ✅ Correct: Get items by city (calls real controller now)
router.get("/city/:city", getItemByCity);


// Stage 6: rate item
router.post("/rate/:itemId", isAuth, rateItem);

export default router;
