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

        // Psychological sub-scores
        physicalDemand: { type: Number, enum: [1, 2, 3], required: true },
        complexity: { type: Number, enum: [1, 2, 3], required: true },
        psychological: { type: Number, required: true }, // sum: 2–6

        // Posture sub-scores
        neck: { type: Number, enum: [1, 2, 3], required: true },
        arm: { type: Number, enum: [1, 2, 3], required: true },
        wrist: { type: Number, enum: [1, 2, 3], required: true },
        back: { type: Number, enum: [1, 2, 3], required: true },
        leg: { type: Number, enum: [1, 2, 3], required: true },
        posture: { type: Number, required: true }, // sum: 5–15

        handling: { type: Number, enum: [1, 2, 3], required: true },

        stability: {
            type: String,
            enum: ['very_stable', 'somewhat_unsteady', 'very_unsteady'],
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
