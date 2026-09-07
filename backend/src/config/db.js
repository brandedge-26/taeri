import mongoose from "mongoose";
import { ENV } from "./env.js";



const connectionOptions = {
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 10000,
    heartbeatFrequencyMS: 10000,
    maxPoolSize: 10,
    retryWrites: true,
};



export const connectDB = async () => {

    const DB_URL = ENV.DB_URL;

    if (!DB_URL) {
        console.error("Error: DB_URL environment variable is missing!");
        process.exit(1);
    }

    try {

        await mongoose.connect(DB_URL, connectionOptions);

        console.log(`MongoDB Connected`);

        mongoose.connection.on("error", (err) => {
            console.error(`Database connection error: ${err}`);
        });

        mongoose.connection.on("disconnected", () => {
            console.warn("MongoDB disconnected. Attempting to reconnect...");
            setTimeout(async () => {
                try {
                    await mongoose.connect(DB_URL, connectionOptions);
                    console.log("MongoDB reconnected successfully.");
                } catch (err) {
                    console.error(`Reconnection failed: ${err.message}`);
                }
            }, 5000);
        });

    } catch (err) {
        console.error(`Connection Failed: ${err.message}`);
        process.exit(1);
    }
};