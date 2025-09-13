import express from "express";
import isAuth from "../middlewares/isAuth.js";

import { getCurrentUser, updateLocation } from "../controllers/userController.js"

const userRouter= express.Router()
// Define user-related routes here, e.g. profile, update, delete, etc.

userRouter.get("/current",isAuth,getCurrentUser)

userRouter.post("/update-location", isAuth, updateLocation);



export default userRouter