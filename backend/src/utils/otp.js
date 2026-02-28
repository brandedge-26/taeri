import crypto from "crypto";
import bcrypt from "bcrypt";




// GENERATE OTP 
export const generateOtp = () => {
    return crypto.randomInt(100000, 999999).toString();
};



// HASH OTP using bcrypt
export const hashOtp = async (otp) => {
    const saltRounds = 8;
    return await bcrypt.hash(otp, saltRounds);
};




// VERIFY OTP using bcrypt
export const verifyOtp = async (otp, otpHash) => {
    try {
        return await bcrypt.compare(otp, otpHash);
    } catch (error) {
        return false;
    }
};