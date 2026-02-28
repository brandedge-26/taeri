import { registerSchema, loginSchema, otpSchema } from "../schemas/auth.schema.js";
import { User } from "../models/User.js";
import { Otp } from "../models/Otp.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import { generateOtp, hashOtp, verifyOtp } from "../utils/otp.js";
import bcrypt from "bcrypt";
import { ENV } from "../config/env.js";
import { sendOtpEmail } from "../utils/email.js";





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
        const otpExpiresMinutes = 10;
        const otpExpiresAt = new Date(Date.now() + otpExpiresMinutes * 60 * 1000);


        await Otp.deleteMany({ email, purpose: "register" });
        await Otp.create({
            email,
            otpHash,
            purpose: "register",
            expiresAt: otpExpiresAt
        });


        await sendOtpEmail({ to: email, otp, expiresMinutes: otpExpiresMinutes });


        // GENERATE TOKENS
        const accessToken = generateAccessToken({ id: newUser.user_id });
        const refreshToken = generateRefreshToken({ id: newUser.user_id });



        // STORE REFRESH TOKEN IN COOKIE
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });



        // SUCCESS RESPONSE
        return res.status(201).json({
            success: true,
            message: "Registration successfully! OTP sent to your email.",
            accessToken,
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

            const err = new Error("Invalid OTP.");
            err.statusCode = 400;
            throw err;
        }


        otpDoc.consumedAt = new Date();
        await otpDoc.save();

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
            const err = new Error("Invalid email or password.");
            err.statusCode = 401;
            throw err;
        }


        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            const err = new Error("Invalid email or password.");
            err.statusCode = 401;
            throw err;
        }


        // GENERATE ACCESS + REFRESH TOKEN
        const accessToken = generateAccessToken({ id: user.user_id });
        const refreshToken = generateRefreshToken({ id: user.user_id });



        // SAVE REFRESH TOKEN IN COOKIE
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
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





export {
    registerController,
    verifyOtpController,
    loginController,
    logoutController
}