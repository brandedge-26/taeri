import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoSanitize from "express-mongo-sanitize";
import { connectDB } from "./config/db.js";
import { globalErrorHandler } from "./middlewares/error.middleware.js";
import { authRoutes } from "./routes/auth.routes.js";





// DB CONNECTION
await connectDB();



// EXPRESS APP
export const app = express();




// COOKIE PARSING
app.use(cookieParser());



// PARSING INCOMING DATA
app.use(express.json());
app.use(express.urlencoded({ extended: true }));




// NOSQL INJECTION PROTECTION
app.use(mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
        console.warn(`Sanitized key: ${key} in request from IP: ${req.ip}`);
    },
}));




// CORS CONFIGURATION
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));




// API HEALTH
app.get("/api/health", (req, res) => {
    res.send("API Working...");
});




// ROUTES
app.use("/api/auth", authRoutes);



// GLOBAL ERROR HANDLER
app.use(globalErrorHandler);