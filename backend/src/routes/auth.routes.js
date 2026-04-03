import express from "express";
import { registerController, verifyOtpController, resendOtpController, loginController, logoutController, updateProfileController, uploadAvatarController, deleteAccountController, forgotPasswordController, resetPasswordController } from "../controllers/auth.controller.js";
import { authLimiter, otpLimiter } from "../middlewares/rateLimiter.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { upload } from "../config/multer.js";
import passport from "passport";
import { googleAuthSuccess } from "../middlewares/passport.middleware.js";



export const authRoutes = express.Router();



authRoutes.post("/register", authLimiter, registerController);
authRoutes.post("/verify-otp", otpLimiter, verifyOtpController);
authRoutes.post("/resend-otp", authLimiter, resendOtpController);
authRoutes.post("/login", authLimiter, loginController);
authRoutes.post("/logout", logoutController);
authRoutes.patch("/update-profile", authMiddleware, updateProfileController);
authRoutes.patch("/upload-avatar", authMiddleware, upload.single("avatar"), uploadAvatarController);
authRoutes.delete("/delete-account", authMiddleware, deleteAccountController);



authRoutes.post("/forgot-password", authLimiter, forgotPasswordController);
authRoutes.post("/reset-password", authLimiter, resetPasswordController);



// GOOGLE ROUTES
authRoutes.get(
    "/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
        prompt: "select_account"
    })
);


authRoutes.get(
    "/google/callback",
    passport.authenticate("google", { session: false }),
    googleAuthSuccess
);