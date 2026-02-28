import nodemailer from "nodemailer";
import { ENV } from "./env.js";



export const mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: ENV.SENDER_EMAIL,
        pass: ENV.SENDER_PASS
    }
});