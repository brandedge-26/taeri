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
            required: true,
            minlength: 6,
        },
        age: {
            type: Number,
            min: 0,
            max: 120,
            required: true,
        },
        livingSituation: {
            type: String,
            enum: ["alone", "family", "spouse"],
            required: true,
        },
    },
    { timestamps: true }
);



export const User = mongoose.models.User || mongoose.model("User", userSchema);