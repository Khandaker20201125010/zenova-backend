"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    // Server
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
    // JWT
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    // Database
    DATABASE_URL: process.env.DATABASE_URL || '',
    // Cloudinary
    CLOUDINARY: {
        CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
        API_KEY: process.env.CLOUDINARY_API_KEY || '',
        API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
    },
    // Stripe
    STRIPE: {
        SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
        WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
        PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || '',
    },
    // OpenAI
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    // Email
    EMAIL: {
        HOST: process.env.EMAIL_HOST || '',
        PORT: parseInt(process.env.EMAIL_PORT || '587'),
        USER: process.env.EMAIL_USER || '',
        PASSWORD: process.env.EMAIL_PASSWORD || '',
        FROM: process.env.EMAIL_FROM || 'noreply@saasplatform.com',
    },
};
//# sourceMappingURL=index.js.map