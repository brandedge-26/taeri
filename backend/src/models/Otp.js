import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            trim: true,
            lowercase: true,
            required: true,
            index: true,
        },
        otpHash: {
            type: String,
            required: true,
        },
        purpose: {
            type: String,
            required: true,
            index: true,
        },
        expiresAt: {
            type: Date,
            required: true,
            index: { expires: 0 },
        },
        attempts: {
            type: Number,
            default: 0,
            min: 0,
        },
        consumedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

export const Otp = mongoose.models.Otp || mongoose.model("Otp", otpSchema);
