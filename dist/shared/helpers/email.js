"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetEmail = exports.sendWelcomeEmail = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = require("../../config");
const transporter = nodemailer_1.default.createTransport({
    host: config_1.config.EMAIL.HOST,
    port: config_1.config.EMAIL.PORT,
    secure: false,
    auth: {
        user: config_1.config.EMAIL.USER,
        pass: config_1.config.EMAIL.PASSWORD,
    },
});
const sendEmail = async (to, subject, html) => {
    try {
        await transporter.sendMail({
            from: config_1.config.EMAIL.FROM,
            to,
            subject,
            html,
        });
    }
    catch (error) {
        console.error('Email sending failed:', error);
        throw error;
    }
};
exports.sendEmail = sendEmail;
const sendWelcomeEmail = async (email, name) => {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to SaaS Platform, ${name}!</h2>
      <p>Thank you for joining our platform. We're excited to have you on board.</p>
      <p>Get started by exploring our features and don't hesitate to contact us if you need help.</p>
      <br>
      <p>Best regards,<br>The SaaS Platform Team</p>
    </div>
  `;
    await (0, exports.sendEmail)(email, 'Welcome to SaaS Platform', html);
};
exports.sendWelcomeEmail = sendWelcomeEmail;
const sendPasswordResetEmail = async (email, token) => {
    const resetUrl = `${config_1.config.FRONTEND_URL}/reset-password?token=${token}`;
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset Request</h2>
      <p>You requested to reset your password. Click the link below to proceed:</p>
      <p><a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
      <p>This link will expire in 1 hour.</p>
      <br>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
  `;
    await (0, exports.sendEmail)(email, 'Reset Your Password', html);
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
//# sourceMappingURL=email.js.map