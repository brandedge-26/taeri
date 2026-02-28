import { mailTransporter } from "../config/nodemailer.js";
import { ENV } from "../config/env.js";




// OTP EMAIL TEMPLATE
const otpEmailTemplate = (otp, expiresMinutes) => {

    const safeOtp = String(otp);

    return {
        subject: "Your OTP Code",
        text: `Your OTP code is ${safeOtp}. It expires in ${expiresMinutes} minutes.`,
        html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
            <h2 style="margin: 0 0 12px;">Your OTP Code</h2>
            <p style="margin: 0 0 12px;">Use the code below to complete your verification.</p>
            <div style="font-size: 28px; letter-spacing: 6px; font-weight: 700; margin: 12px 0;">
                ${safeOtp}
            </div>
            <p style="margin: 0 0 12px;">This code expires in ${expiresMinutes} minutes.</p>
            <p style="margin: 0;">If you did not request this, you can ignore this email.</p>
        </div>
        `.trim()
    };

};





// SEND OTP EMAIL
export const sendOtpEmail = async ({ to, otp, expiresMinutes = 10 }) => {

    const tpl = otpEmailTemplate(otp, expiresMinutes);
    const from = ENV.SMTP_FROM || ENV.SMTP_USER;

    return mailTransporter.sendMail({
        from,
        to,
        subject: tpl.subject,
        text: tpl.text,
        html: tpl.html
    });

};