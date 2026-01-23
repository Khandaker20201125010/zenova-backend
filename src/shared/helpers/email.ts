import nodemailer from 'nodemailer';
import { config } from '../../config';


const transporter = nodemailer.createTransport({
  host: config.EMAIL.HOST,
  port: config.EMAIL.PORT,
  secure: false,
  auth: {
    user: config.EMAIL.USER,
    pass: config.EMAIL.PASSWORD,
  },
});

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<void> => {
  try {
    await transporter.sendMail({
      from: config.EMAIL.FROM,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

export const sendWelcomeEmail = async (email: string, name: string) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to SaaS Platform, ${name}!</h2>
      <p>Thank you for joining our platform. We're excited to have you on board.</p>
      <p>Get started by exploring our features and don't hesitate to contact us if you need help.</p>
      <br>
      <p>Best regards,<br>The SaaS Platform Team</p>
    </div>
  `;

  await sendEmail(email, 'Welcome to SaaS Platform', html);
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetUrl = `${config.FRONTEND_URL}/reset-password?token=${token}`;
  
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

  await sendEmail(email, 'Reset Your Password', html);
};