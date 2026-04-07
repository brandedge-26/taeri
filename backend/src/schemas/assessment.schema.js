import { z } from "zod";

export const addAssessmentSchema = z.object({
    taskId: z.string().trim().min(1),
    taskName: z.string().trim().min(1),
    date: z.string().datetime(),
    frequency: z.enum(["1/week", "2/week", "3/week", "4-7/week"]),
    duration: z.enum(["<5", "5-15", "16-25", "26-35", "36-45", "46-60", ">60"]),
    // Psychological
    physicalDemand: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    complexity: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    psychological: z.number().min(2).max(6),
    // Posture
    neck: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    arm: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    wrist: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    back: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    leg: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    posture: z.number().min(5).max(15),
    // Handling & Stability
    handling: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    stability: z.enum(["very_stable", "somewhat_unsteady", "very_unsteady"]),
    // Computed
    rawScore: z.number(),
    adjustmentFactor: z.number(),
    finalScore: z.number(),
    riskLevel: z.enum(["green", "yellow", "red"]),
});
