import mongoose from "mongoose";


const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            unique: true,
            required: true,
        },
        password: {
            type: String,
            default: null,
            minlength: 6,
        },
        provider: {
            type: String,
            enum: ["local", "google"],
            default: "local",
        },
        providerId: {
            type: String,
            default: null,
        },
        avatar: {
            type: String,
            default: null,
        },
        age: {
            type: Number,
            min: 0,
            max: 120,
        },
        livingSituation: {
            type: String,
            enum: ["alone", "family", "spouse"],
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        profilePicture: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);



export const User = mongoose.models.User || mongoose.model("User", userSchema);