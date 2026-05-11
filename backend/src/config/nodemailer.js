import nodemailer from "nodemailer";
import { ENV } from "./env.js";



export const mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: ENV.SENDER_EMAIL,
        pass: ENV.SENDER_PASS
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
});