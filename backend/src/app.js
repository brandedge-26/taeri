import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import passport from "passport";
import { sanitizeInput } from "./middlewares/sanitize.middleware.js";
import { connectDB } from "./config/db.js";
import { globalErrorHandler } from "./middlewares/error.middleware.js";
import { authRoutes } from "./routes/auth.routes.js";
import { assessmentRoutes } from "./routes/assessment.routes.js";
import { otpEmailTemplate, welcomeEmailTemplate } from "./utils/email.js";
import "./passport/auth.passport.js";





// DB CONNECTION
await connectDB();



// EXPRESS APP
export const app = express();




// COOKIE PARSING
app.use(cookieParser());



// PARSING INCOMING DATA
app.use(express.json());
app.use(express.urlencoded({ extended: true }));




// NOSQL INJECTION PROTECTION (Express 5.x compatible)
app.use(sanitizeInput);




// CORS CONFIGURATION
app.use(cors({
    origin: true, // development mein sab allow
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));




// PASSPORT INTIIALIZATION
app.use(passport.initialize());




// API HEALTH
app.get("/api/health", (req, res) => {
    res.send("API Working...");
});




// EMAIL PREVIEW (Development only)
app.get("/api/email-preview/:type", (req, res) => {
    const { type } = req.params;

    if (type === "otp") {
        const tpl = otpEmailTemplate("123456", 3);
        return res.type("html").send(tpl.html);
    } else if (type === "welcome") {
        const tpl = welcomeEmailTemplate("John Doe");
        return res.type("html").send(tpl.html);
    }

    res.status(404).json({ message: "Template not found" });
});





// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/assessments", assessmentRoutes);



// GLOBAL ERROR HANDLER
app.use(globalErrorHandler);