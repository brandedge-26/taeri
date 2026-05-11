import { registerSchema, loginSchema, otpSchema, profileUpdateSchema, resetPasswordSchema } from "../schemas/auth.schema.js";
import { User } from "../models/User.js";
import { Otp } from "../models/Otp.js";
import { Assessment } from "../models/Assessment.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import { generateOtp, hashOtp, verifyOtp } from "../utils/otp.js";
import bcrypt from "bcrypt";
import { ENV } from "../config/env.js";
import { sendOtpEmail, sendWelcomeEmail } from "../utils/email.js";
import { z } from "zod";





// REGISTER CONTROLLER
const registerController = async (req, res, next) => {
    try {


        const parsedSchema = registerSchema.safeParse(req.body);
        const { success, data, error } = parsedSchema;
        if (!success) return next(error);



        // DESTRUCTURING DATA
        const { name, email, password, age, livingSituation } = data;


        // CHECK IF USER EXISTS
        const user = await User.findOne({ email });
        if (user) {
            throw new Error("User already exists with this email!");
        }



        // SECURING PASSWORD
        const hashedPassword = await bcrypt.hash(password, 10);



        // CREATE NEW USER IN DB
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            age,
            livingSituation
        });


        await newUser.save();



        // OTP LOGIC
        const otp = generateOtp();
        const otpHash = await hashOtp(otp);
        const otpExpiresMinutes = 3;
        const otpExpiresAt = new Date(Date.now() + otpExpiresMinutes * 60 * 1000);


        // Smart deletion - Only delete expired or consumed OTPs
        await Otp.deleteMany({
            email,
            purpose: "register",
            $or: [
                { expiresAt: { $lt: new Date() } },  // Expired
                { consumedAt: { $ne: null } }         // Already used
            ]
        });

        await Otp.create({
            email,
            otpHash,
            purpose: "register",
            expiresAt: otpExpiresAt
        });


        sendOtpEmail({ to: email, otp, expiresMinutes: otpExpiresMinutes }).catch((emailErr) => {
            console.error("OTP email failed:", emailErr.message);
        });


        // SUCCESS RESPONSE
        return res.status(201).json({
            success: true,
            message: "Registration successfully! OTP sent to your email.",
            user: {
                userId: newUser._id,
                name: newUser.name,
                email: newUser.email,
                age: newUser.age,
                profilePicture: null,
            }
        });



    } catch (err) {
        next(err);
    }
}






// VERIFY OTP CONTROLLER
const verifyOtpController = async (req, res, next) => {
    try {


        const parsedSchema = otpSchema.safeParse(req.body);
        const { success, data, error } = parsedSchema;
        if (!success) return next(error);


        const { email, otp } = data;


        const otpDoc = await Otp.findOne({ email, purpose: "register" })
            .sort({ createdAt: -1 })
            .exec();


        if (!otpDoc) {
            const err = new Error("OTP not found. Please request a new OTP.");
            err.statusCode = 404;
            throw err;
        }


        if (otpDoc.consumedAt) {
            const err = new Error("OTP already used. Please request a new OTP.");
            err.statusCode = 400;
            throw err;
        }

        // Manual expiry check with detailed error message
        const currentTime = new Date();
        if (otpDoc.expiresAt < currentTime) {
            const expiredMinutesAgo = Math.floor((currentTime - otpDoc.expiresAt) / (60 * 1000));

            const err = new Error(
                `OTP expired ${expiredMinutesAgo} minute(s) ago. Please request a new OTP.`
            );
            err.statusCode = 400;
            throw err;
        }


        if (otpDoc.attempts >= 5) {
            const err = new Error("Too many invalid attempts. Please request a new OTP.");
            err.statusCode = 429;
            throw err;
        }


        const isValid = await verifyOtp(otp, otpDoc.otpHash);
        if (!isValid) {
            otpDoc.attempts += 1;
            await otpDoc.save();

            const remainingAttempts = 5 - otpDoc.attempts;
            const err = new Error(
                `Invalid OTP. ${remainingAttempts} attempt(s) remaining.`
            );
            err.statusCode = 400;
            throw err;
        }


        otpDoc.consumedAt = new Date();
        await otpDoc.save();

        const user = await User.findOne({ email });
        if (user && !user.isEmailVerified) {
            user.isEmailVerified = true;
            await user.save();
            
            // Send welcome email after successful verification
            try {
                await sendWelcomeEmail({ to: email, name: user.name });
            } catch (emailErr) {
                console.log("Welcome email failed:", emailErr.message);
                // Don't fail the request if welcome email fails
            }
        }

        return res.status(200).json({
            success: true,
            message: "OTP verified successfully. You can now login"
        });

    } catch (err) {
        next(err);
    }
};






// LOGIN CONTROLLER
const loginController = async (req, res, next) => {
    try {


        const parsedSchema = loginSchema.safeParse(req.body);
        const { success, data, error } = parsedSchema;
        if (!success) return next(error);


        const { email, password } = data;



        const user = await User.findOne({ email });
        if (!user) {
            const err = new Error("Invalid credentials.");
            err.statusCode = 401;
            throw err;
        }


        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            const err = new Error("Invalid credentials.");
            err.statusCode = 401;
            throw err;
        }

        if (!user.isEmailVerified) {
            const err = new Error("Email not verified. Please verify OTP first.");
            err.statusCode = 403;
            throw err;
        }


        // GENERATE ACCESS + REFRESH TOKEN
        const accessToken = generateAccessToken({ id: user._id });
        const refreshToken = generateRefreshToken({ id: user._id });



        // SAVE REFRESH TOKEN IN COOKIE
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: ENV.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });



        return res.status(200).json({
            success: true,
            message: "Login successful.",
            accessToken,
            user: {
                userId: user._id,
                name: user.name,
                email: user.email,
                age: user.age,
                livingSituation: user.livingSituation,
                profilePicture: user.profilePicture,
            }
        });

    } catch (err) {
        next(err);
    }
};





// LOGOUT CONTROLLER
const logoutController = async (req, res, next) => {
    try {


        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: ENV.NODE_ENV === "production",
            sameSite: "strict"
        });

        return res.status(200).json({
            success: true,
            message: "Logout successful."
        });


    } catch (err) {
        next(err);
    }
};





// RESEND OTP CONTROLLER
const resendOtpController = async (req, res, next) => {
    try {

        const parsedSchema = z.object({
            email: z.string().email(),
        }).safeParse(req.body);


        const { success, data, error } = parsedSchema;
        if (!success) return next(error);


        const { email } = data;


        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            const err = new Error("User not found with this email.");
            err.statusCode = 404;
            throw err;
        }


        // Check if already verified
        if (user.isEmailVerified) {
            const err = new Error("Email already verified. You can login directly.");
            err.statusCode = 400;
            throw err;
        }


        // Check if there's a valid recent OTP (prevent spam)
        const recentValidOtp = await Otp.findOne({
            email,
            purpose: "register",
            expiresAt: { $gt: new Date() },           // Not expired
            consumedAt: null,                          // Not used
            createdAt: { $gte: new Date(Date.now() - 60 * 1000) } // Last 1 minute
        });


        if (recentValidOtp) {
            const err = new Error("OTP already sent. Please wait 1 minute before requesting again.");
            err.statusCode = 429;
            throw err;
        }


        // Generate new OTP
        const otp = generateOtp();
        const otpHash = await hashOtp(otp);
        const otpExpiresMinutes = 3;
        const otpExpiresAt = new Date(Date.now() + otpExpiresMinutes * 60 * 1000);


        // Smart deletion - Only delete expired or consumed OTPs
        await Otp.deleteMany({
            email,
            purpose: "register",
            $or: [
                { expiresAt: { $lt: new Date() } },  // Expired
                { consumedAt: { $ne: null } }         // Already used
            ]
        });

        await Otp.create({
            email,
            otpHash,
            purpose: "register",
            expiresAt: otpExpiresAt
        });


        // Send OTP email
        sendOtpEmail({ to: email, otp, expiresMinutes: otpExpiresMinutes }).catch((emailErr) => {
            console.error("Resend OTP email failed:", emailErr.message);
        });


        return res.status(200).json({
            success: true,
            message: "New OTP sent to your email successfully."
        });


    } catch (err) {
        next(err);
    }
};




// PROFILE UPDATE CONTROLLER
const updateProfileController = async (req, res, next) => {
    try {


        const parsedSchema = profileUpdateSchema.safeParse(req.body);
        const { success, data, error } = parsedSchema;
        if (!success) return next(error);


        const userId = req.user?.id;
        if (!userId) {
            const err = new Error("Unauthorized.");
            err.statusCode = 401;
            throw err;
        }


        const updateData = {
            age: data.age,
            livingSituation: data.livingSituation
        };


        if (data.name) updateData.name = data.name;


        const user = await User.findByIdAndUpdate(userId, updateData, { returnDocument: 'after' });

        if (!user) {
            const err = new Error("User not found.");
            err.statusCode = 404;
            throw err;
        }


        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            user: {
                userId: user._id,
                name: user.name,
                email: user.email,
                age: user.age,
                livingSituation: user.livingSituation,
                profilePicture: user.profilePicture,
            }
        });

    } catch (err) {
        next(err);
    }
};




// UPLOAD AVATAR CONTROLLER
const uploadAvatarController = async (req, res, next) => {
    try {

        const userId = req.user?.id;
        if (!userId) {
            const err = new Error("Unauthorized.");
            err.statusCode = 401;
            throw err;
        }

        if (!req.file) {
            const err = new Error("No image file provided.");
            err.statusCode = 400;
            throw err;
        }

        const imageUrl = req.file.path;

        const user = await User.findByIdAndUpdate(
            userId,
            { profilePicture: imageUrl },
            { returnDocument: 'after' }
        );

        if (!user) {
            const err = new Error("User not found.");
            err.statusCode = 404;
            throw err;
        }

        return res.status(200).json({
            success: true,
            message: "Profile picture updated successfully.",
            user: {
                userId: user._id,
                name: user.name,
                email: user.email,
                age: user.age,
                livingSituation: user.livingSituation,
                profilePicture: user.profilePicture,
            }
        });

    } catch (err) {
        next(err);
    }
};




// DELETE ACCOUNT CONTROLLER
const deleteAccountController = async (req, res, next) => {
    try {

        const userId = req.user?.id;
        if (!userId) {
            const err = new Error("Unauthorized.");
            err.statusCode = 401;
            throw err;
        }

        const user = await User.findById(userId);
        if (!user) {
            const err = new Error("User not found.");
            err.statusCode = 404;
            throw err;
        }

        await Assessment.deleteMany({ userId });
        await Otp.deleteMany({ email: user.email });
        await User.findByIdAndDelete(userId);

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: ENV.NODE_ENV === "production",
            sameSite: "strict"
        });

        return res.status(200).json({
            success: true,
            message: "Account deleted successfully."
        });

    } catch (err) {
        next(err);
    }
};



// FORGOT PASSWORD CONTROLLER
const forgotPasswordController = async (req, res, next) => {
    try {

        const parsed = z.object({ email: z.string().email() }).safeParse(req.body);
        if (!parsed.success) return next(parsed.error);

        const { email } = parsed.data;

        const user = await User.findOne({ email });
        if (!user) {
            const err = new Error("No account found with this email.");
            err.statusCode = 404;
            throw err;
        }

        // Check spam — no new OTP if a valid one was sent in last 1 minute
        const recentOtp = await Otp.findOne({
            email,
            purpose: "reset-password",
            expiresAt: { $gt: new Date() },
            consumedAt: null,
            createdAt: { $gte: new Date(Date.now() - 60 * 1000) }
        });

        if (recentOtp) {
            const err = new Error("OTP already sent. Please wait 1 minute before requesting again.");
            err.statusCode = 429;
            throw err;
        }

        const otp = generateOtp();
        const otpHash = await hashOtp(otp);
        const otpExpiresMinutes = 10;
        const otpExpiresAt = new Date(Date.now() + otpExpiresMinutes * 60 * 1000);

        await Otp.deleteMany({
            email,
            purpose: "reset-password",
            $or: [
                { expiresAt: { $lt: new Date() } },
                { consumedAt: { $ne: null } }
            ]
        });

        await Otp.create({ email, otpHash, purpose: "reset-password", expiresAt: otpExpiresAt });

        await sendOtpEmail({ to: email, otp, expiresMinutes: otpExpiresMinutes });

        return res.status(200).json({
            success: true,
            message: "OTP sent to your email for password reset."
        });

    } catch (err) {
        next(err);
    }
};



// RESET PASSWORD CONTROLLER
const resetPasswordController = async (req, res, next) => {
    try {

        const parsed = resetPasswordSchema.safeParse(req.body);
        if (!parsed.success) return next(parsed.error);

        const { email, otp, newPassword } = parsed.data;

        const otpDoc = await Otp.findOne({ email, purpose: "reset-password" })
            .sort({ createdAt: -1 })
            .exec();

        if (!otpDoc) {
            const err = new Error("OTP not found. Please request a new OTP.");
            err.statusCode = 404;
            throw err;
        }

        if (otpDoc.consumedAt) {
            const err = new Error("OTP already used. Please request a new OTP.");
            err.statusCode = 400;
            throw err;
        }

        if (otpDoc.expiresAt < new Date()) {
            const err = new Error("OTP expired. Please request a new OTP.");
            err.statusCode = 400;
            throw err;
        }

        if (otpDoc.attempts >= 5) {
            const err = new Error("Too many invalid attempts. Please request a new OTP.");
            err.statusCode = 429;
            throw err;
        }

        const isValid = await verifyOtp(otp, otpDoc.otpHash);
        if (!isValid) {
            otpDoc.attempts += 1;
            await otpDoc.save();
            const remaining = 5 - otpDoc.attempts;
            const err = new Error(`Invalid OTP. ${remaining} attempt(s) remaining.`);
            err.statusCode = 400;
            throw err;
        }

        otpDoc.consumedAt = new Date();
        await otpDoc.save();

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.findOneAndUpdate({ email }, { password: hashedPassword });

        return res.status(200).json({
            success: true,
            message: "Password reset successfully. You can now login."
        });

    } catch (err) {
        next(err);
    }
};



export {
    registerController,
    verifyOtpController,
    resendOtpController,
    loginController,
    logoutController,
    updateProfileController,
    uploadAvatarController,
    deleteAccountController,
    forgotPasswordController,
    resetPasswordController,
}