// routes/itemRoutes.js
import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { 
  addItem, 
  deleteItem, 
  editItem, 
  getItemByCity, 
  getItemById 
} from "../controllers/itemController.js";
import upload from "../middlewares/multer.js";

const itemRouter = express.Router();

// All routes use simple relative paths with proper parameter syntax
itemRouter.post("/add-item", isAuth, upload.single("image"), addItem);
itemRouter.put("/edit-item/:itemId", isAuth, upload.single("image"), editItem);
itemRouter.get("/get-by-id/:itemId", isAuth, getItemById);
itemRouter.delete("/delete/:itemId", isAuth, deleteItem);
itemRouter.get("/get-by-city/:city", getItemByCity);

export default itemRouter;
