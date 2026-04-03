import mongoose from "mongoose";

const assessmentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        taskId: {
            type: String,
            required: true,
        },

        taskName: {
            type: String,
            required: true,
            trim: true,
        },

        date: {
            type: Date,
            required: true,
        },

        // ── TAER Scoring Inputs ──────────────────────────────────────────────

        frequency: {
            type: String,
            enum: ["1/week", "2/week", "3/week", "4-7/week"],
            required: true,
        },

        duration: {
            type: String,
            enum: ["<5", "5-15", "16-25", "26-35", "36-45", "46-60", ">60"],
            required: true,
        },

        psychological: {
            type: Number,
            enum: [1, 2, 3],
            required: true,
        },

        posture: {
            type: Number,
            enum: [1, 2, 3],
            required: true,
        },

        handling: {
            type: Number,
            enum: [1, 2, 3],
            required: true,
        },

        // ── Calculated Scores ────────────────────────────────────────────────

        rawScore: {
            type: Number,
            required: true,
        },

        adjustmentFactor: {
            type: Number,
            required: true,
        },

        finalScore: {
            type: Number,
            required: true,
        },

        riskLevel: {
            type: String,
            enum: ["green", "yellow", "red"],
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Assessment = mongoose.model("Assessment", assessmentSchema);
