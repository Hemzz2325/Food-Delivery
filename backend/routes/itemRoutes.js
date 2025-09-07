import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { addItem, editItem } from "../controllers/itemcontroller.js";
import upload from "../middlewares/multer.js";



const itemRouter= express.Router()
// Define user-related routes here, e.g. profile, update, delete, etc.

itemRouter.post("/add-item",isAuth,upload.single('image'),addItem)
itemRouter.post("/edit-item/:itemId",isAuth,upload.single('image'),editItem)

export default itemRouter