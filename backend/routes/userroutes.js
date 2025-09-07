import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { getCurrentUser } from "../controllers/userController.js";

const userRouter= express.Router()
// Define user-related routes here, e.g. profile, update, delete, etc.

userRouter.get("/current",isAuth,getCurrentUser)

export default userRouter