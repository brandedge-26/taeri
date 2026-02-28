import nodemailer from "nodemailer";
import { ENV } from "./env.js";



export const mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: ENV.SMTP_USER,
        pass: ENV.SMTP_PASS
    }
});