import express from "express";
import { registerController, verifyOtpController, resendOtpController, loginController, logoutController, updateProfileController } from "../controllers/auth.controller.js";
import { authLimiter, otpLimiter } from "../middlewares/rateLimiter.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";



export const authRoutes = express.Router();



authRoutes.post("/register", authLimiter, registerController);
authRoutes.post("/verify-otp", otpLimiter, verifyOtpController);
authRoutes.post("/resend-otp", authLimiter, resendOtpController);
authRoutes.post("/login", authLimiter, loginController);
authRoutes.post("/logout", logoutController);
authRoutes.patch("/update-profile", authMiddleware, updateProfileController);
