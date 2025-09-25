import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { getCurrentUser, updateLocation } from "../controllers/userController.js";

const router = express.Router();

router.get("/current", isAuth, getCurrentUser);
router.post("/location", isAuth, updateLocation);

export default router;
