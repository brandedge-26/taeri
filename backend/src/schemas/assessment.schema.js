import { z } from "zod";

export const addAssessmentSchema = z.object({
    taskId: z.string().trim().min(1),
    taskName: z.string().trim().min(1),
    date: z.string().datetime(),
    frequency: z.enum(["1/week", "2/week", "3/week", "4-7/week"]),
    duration: z.enum(["<5", "5-15", "16-25", "26-35", "36-45", "46-60", ">60"]),
    psychological: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    posture: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    handling: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    rawScore: z.number(),
    adjustmentFactor: z.number(),
    finalScore: z.number(),
    riskLevel: z.enum(["green", "yellow", "red"]),
});
