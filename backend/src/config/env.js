import "dotenv/config";


// VALIDATE REQUIRED ENVIRONMENT VARIABLES
const validateEnv = () => {
    
    const required = [
        'ACCESS_TOKEN_SECRET',
        'REFRESH_TOKEN_SECRET',
        'DB_URL'
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
        process.exit(1);
    }

    // Validate JWT secrets are strong enough (minimum 32 characters)
    if (process.env.ACCESS_TOKEN_SECRET.length < 32) {
        console.error('❌ ACCESS_TOKEN_SECRET must be at least 32 characters long');
        process.exit(1);
    }

    if (process.env.REFRESH_TOKEN_SECRET.length < 32) {
        console.error('❌ REFRESH_TOKEN_SECRET must be at least 32 characters long');
        process.exit(1);
    }

};

validateEnv();


export const ENV = {

    PORT: process.env.PORT,
    DB_URL: process.env.DB_URL,
    NODE_ENV: process.env.NODE_ENV,

    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,

    SENDER_EMAIL: process.env.SENDER_EMAIL,
    SENDER_PASS: process.env.SENDER_PASS,

}
