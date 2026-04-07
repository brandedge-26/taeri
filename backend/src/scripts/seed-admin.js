import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { User } from "../models/User.js";

const DB_URL = process.env.DB_URL;

if (!DB_URL) {
    console.error("DB_URL environment variable is missing.");
    process.exit(1);
}

const adminData = {
    name: "admin",
    email: "admin@taeri.local",
    password: "admin-123",
    provider: "local",
    age: 30,
    livingSituation: "alone",
    isEmailVerified: true,
};

try {
    await mongoose.connect(DB_URL, {
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
    });

    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    const adminUser = await User.findOneAndUpdate(
        { email: adminData.email },
        {
            $set: {
                name: adminData.name,
                email: adminData.email,
                password: hashedPassword,
                provider: adminData.provider,
                age: adminData.age,
                livingSituation: adminData.livingSituation,
                isEmailVerified: adminData.isEmailVerified,
            },
        },
        {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
        }
    );

    console.log("Admin user ready in MongoDB.");
    console.log(`email: ${adminUser.email}`);
    console.log(`password: ${adminData.password}`);
} catch (error) {
    console.error("Failed to seed admin user:", error.message);
    process.exitCode = 1;
} finally {
    await mongoose.disconnect();
}
