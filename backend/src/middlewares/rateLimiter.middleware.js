import rateLimit from "express-rate-limit";



// General API rate limiter - 100 requests per 15 minutes
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
        success: false,
        message: "Too many requests from this IP, please try again after 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false,
});




// Strict limiter for auth endpoints - 10 requests per 15 minutes
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: {
        success: false,
        message: "Too many authentication attempts, please try again after 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Only count failed attempts
});





// OTP verification limiter - 3 attempts per 15 minutes
export const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3,
    message: {
        success: false,
        message: "Too many OTP verification attempts, please try again after 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false,
});