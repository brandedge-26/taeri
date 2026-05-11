import nodemailer from "nodemailer";
import dns from "dns";
import { ENV } from "./env.js";

dns.setDefaultResultOrder("ipv4first");

export const mailTransporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: ENV.SENDER_EMAIL,
        pass: ENV.SENDER_PASS
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
});
