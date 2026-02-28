import express from "express";
import { registerController, verifyOtpController, loginController, logoutController } from "../controllers/auth.controller.js";
import { authLimiter, otpLimiter } from "../middlewares/rateLimiter.middleware.js";



export const authRoutes = express.Router();



authRoutes.post("/register", authLimiter, registerController);
authRoutes.post("/verify-otp", otpLimiter, verifyOtpController);
authRoutes.post("/login", authLimiter, loginController);
authRoutes.post("/logout", logoutController);