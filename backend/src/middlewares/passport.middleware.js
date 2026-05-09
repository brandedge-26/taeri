import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import { ENV } from "../config/env.js";
import { User } from "../models/User.js";


export const googleAuthSuccess = async (req, res) => {

    const { _id } = req.user;

    const user = await User.findById(_id).select("name email avatar");

    if (!user) {
        throw new Error("User not found");
    }

    const accessToken = generateAccessToken({ id: _id });
    const refreshToken = generateRefreshToken({ id: _id });


    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect(
        `${ENV.CLIENT_URL}auth-success?token=${accessToken}&user=${encodeURIComponent(JSON.stringify(user))}`
    );
}