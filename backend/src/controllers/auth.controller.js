import { registerSchema, loginSchema, otpSchema, profileUpdateSchema } from "../schemas/auth.schema.js";
import { User } from "../models/User.js";
import { Otp } from "../models/Otp.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import { generateOtp, hashOtp, verifyOtp } from "../utils/otp.js";
import bcrypt from "bcrypt";
import { ENV } from "../config/env.js";
import { sendOtpEmail } from "../utils/email.js";
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


        await sendOtpEmail({ to: email, otp, expiresMinutes: otpExpiresMinutes });


        // SUCCESS RESPONSE
        return res.status(201).json({
            success: true,
            message: "Registration successfully! OTP sent to your email.",
            user: {
                userId: newUser._id,
                name: newUser.name,
                email: newUser.email,
                age: newUser.age
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
                age: user.age
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
        await sendOtpEmail({ to: email, otp, expiresMinutes: otpExpiresMinutes });


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


        const user = await User.findByIdAndUpdate(userId, updateData, { new: true });

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
                livingSituation: user.livingSituation
            }
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
    updateProfileController
}