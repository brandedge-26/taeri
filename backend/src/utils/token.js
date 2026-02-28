import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";



// ACCESS TOKEN
const generateAccessToken = (payload) => {
    return jwt.sign(payload, ENV.ACCESS_TOKEN_SECRET, {
        expiresIn: "7d" // todo changine it to 15m
    });
}




// REFRESH TOKEN
const generateRefreshToken = (payload) => {
    return jwt.sign(payload, ENV.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d"
    });
}




// VERIFY ACCESS TOKEN
const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, ENV.ACCESS_TOKEN_SECRET);
    } catch (err) {
        throw new Error("Invalid or expired access token");
    }
}




// VERIFY ACCESS TOKEN
const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, ENV.REFRESH_TOKEN_SECRET);
    } catch (err) {
        throw new Error("Invalid or expired access token");
    }
}






export {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
}
