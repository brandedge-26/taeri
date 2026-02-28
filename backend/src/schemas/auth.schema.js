import { z } from "zod";



// LIVING SITATION SCHEMA
const livingSituationEnum = z.enum(["alone", "family", "spouse"]);



// REGISTER SCHEMA
export const registerSchema = z.object({
    name: z.string().trim().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    age: z.number().int().min(0).max(120),
    livingSituation: livingSituationEnum,
});



// LOGIN SCHEMA
export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});



// OTP SCHEMA
export const otpSchema = z.object({
    email: z.string().email(),
    otp: z.string().trim().regex(/^\d{6}$/),
});