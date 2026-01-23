import bcrypt from "bcryptjs";
import {
  LoginInput,
  RegisterInput,
  SocialLoginInput,
  AuthResponse,
  ChangePasswordInput,
} from "./auth.interface";

import { ApiResponse, JwtPayload } from "../../types";
import { prisma } from "../../helpers/prisma";
import {
  generateRefreshToken,
  generateToken,
  verifyToken,
} from "../../helpers/jwt";
import logger from "../../helpers/logger";
import { sendPasswordResetEmail, sendWelcomeEmail } from "../../helpers/email";

export class AuthService {
  async register(data: RegisterInput): Promise<ApiResponse<AuthResponse>> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        return {
          success: false,
          message: "Email already registered",
        };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 12);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name,
          phone: data.phone,
          company: data.company,
          position: data.position,
        },
      });

      // Create subscription
      await prisma.subscription.create({
        data: {
          userId: user.id,
          plan: "FREE",
          status: "ACTIVE",
        },
      });

      // Generate tokens
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const refreshToken = generateRefreshToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Save refresh token
      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      // Log activity
      await prisma.activity.create({
        data: {
          userId: user.id,
          action: "REGISTER",
          entity: "USER",
          entityId: user.id,
        },
      });

      // Send welcome email
      try {
        await sendWelcomeEmail(user.email, user.name);
      } catch (emailError) {
        logger.error("Failed to send welcome email:", emailError);
      }

      return {
        success: true,
        message: "Registration successful",
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar || undefined,
          },
          token,
          refreshToken,
        },
      };
    } catch (error) {
      logger.error("Registration error:", error);
      throw error;
    }
  }

  async login(data: LoginInput): Promise<ApiResponse<AuthResponse>> {
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (!user) {
        return {
          success: false,
          message: "Invalid credentials",
        };
      }

      // Check if user is active
      if (user.status !== "ACTIVE") {
        return {
          success: false,
          message: "Account is inactive",
        };
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(
        data.password,
        user.password,
      );

      if (!isValidPassword) {
        return {
          success: false,
          message: "Invalid credentials",
        };
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      // Generate tokens
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const refreshToken = generateRefreshToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Save refresh token
      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      // Log activity
      await prisma.activity.create({
        data: {
          userId: user.id,
          action: "LOGIN",
          entity: "USER",
          entityId: user.id,
        },
      });

      return {
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar || undefined,
          },
          token,
          refreshToken,
        },
      };
    } catch (error) {
      logger.error("Login error:", error);
      throw error;
    }
  }

  async socialLogin(
    data: SocialLoginInput,
  ): Promise<ApiResponse<AuthResponse>> {
    try {
      let user;

      // Check if user exists by email
      user = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (!user) {
        // Create new user
        user = await prisma.user.create({
          data: {
            email: data.email,
            name: data.name,
            password: await bcrypt.hash(
              Math.random().toString(36).slice(-8),
              12,
            ), // Random password
            googleId: data.googleId,
            facebookId: data.facebookId,
            avatar: data.avatar,
            emailVerified: true,
            emailVerifiedAt: new Date(),
          },
        });

        // Create subscription
        await prisma.subscription.create({
          data: {
            userId: user.id,
            plan: "FREE",
            status: "ACTIVE",
          },
        });
      } else {
        // Update social IDs if not set
        await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: data.googleId || user.googleId,
            facebookId: data.facebookId || user.facebookId,
            avatar: data.avatar || user.avatar,
            lastLoginAt: new Date(),
          },
        });
      }

      // Generate tokens
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const refreshToken = generateRefreshToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Save refresh token
      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      return {
        success: true,
        message: "Social login successful",
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar || undefined,
          },
          token,
          refreshToken,
        },
      };
    } catch (error) {
      logger.error("Social login error:", error);
      throw error;
    }
  }

  async refreshToken(
    refreshToken: string,
  ): Promise<ApiResponse<{ token: string; refreshToken: string }>> {
    try {
      const tokenRecord = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (
        !tokenRecord ||
        tokenRecord.revoked ||
        tokenRecord.expiresAt < new Date()
      ) {
        return {
          success: false,
          message: "Invalid refresh token",
        };
      }

      // Generate new tokens
      const newToken = generateToken({
        userId: tokenRecord.user.id,
        email: tokenRecord.user.email,
        role: tokenRecord.user.role,
      });

      const newRefreshToken = generateRefreshToken({
        userId: tokenRecord.user.id,
        email: tokenRecord.user.email,
        role: tokenRecord.user.role,
      });

      // Revoke old token
      await prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: { revoked: true },
      });

      // Save new refresh token
      await prisma.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId: tokenRecord.user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      return {
        success: true,
        message: "Token refreshed successfully",
        data: {
          token: newToken,
          refreshToken: newRefreshToken,
        },
      };
    } catch (error) {
      logger.error("Refresh token error:", error);
      throw error;
    }
  }

  async logout(refreshToken: string, userId: string): Promise<ApiResponse> {
    try {
      // Revoke refresh token
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken, userId },
        data: { revoked: true },
      });

      // Log activity
      await prisma.activity.create({
        data: {
          userId,
          action: "LOGOUT",
          entity: "USER",
          entityId: userId,
        },
      });

      return {
        success: true,
        message: "Logged out successfully",
      };
    } catch (error) {
      logger.error("Logout error:", error);
      throw error;
    }
  }

  async requestPasswordReset(email: string): Promise<ApiResponse> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        // Don't reveal that user doesn't exist
        return {
          success: true,
          message: "If an account exists, you will receive a reset email",
        };
      }

      // Generate reset token
      const resetToken = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Send reset email
      await sendPasswordResetEmail(email, resetToken);

      // Log activity
      await prisma.activity.create({
        data: {
          userId: user.id,
          action: "PASSWORD_RESET_REQUEST",
          entity: "USER",
          entityId: user.id,
        },
      });

      return {
        success: true,
        message: "Password reset email sent",
      };
    } catch (error) {
      logger.error("Password reset request error:", error);
      throw error;
    }
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<ApiResponse> {
    try {
      let decoded: JwtPayload;
      try {
        decoded = verifyToken(token); // FIX: Use verifyToken instead of generateToken
      } catch (error) {
        return {
          success: false,
          message: "Invalid or expired token",
        };
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      await prisma.user.update({
        where: { id: decoded.userId },
        data: { password: hashedPassword },
      });

      // Log activity
      await prisma.activity.create({
        data: {
          userId: decoded.userId,
          action: "PASSWORD_RESET",
          entity: "USER",
          entityId: decoded.userId,
        },
      });

      // Revoke all refresh tokens
      await prisma.refreshToken.updateMany({
        where: { userId: decoded.userId },
        data: { revoked: true },
      });

      return {
        success: true,
        message: "Password reset successful",
      };
    } catch (error) {
      logger.error("Password reset error:", error);
      throw error;
    }
  }

  async changePassword(
    userId: string,
    data: ChangePasswordInput,
  ): Promise<ApiResponse> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      // Verify current password
      const isValid = await bcrypt.compare(data.currentPassword, user.password);

      if (!isValid) {
        return {
          success: false,
          message: "Current password is incorrect",
        };
      }

      // Update password
      const hashedPassword = await bcrypt.hash(data.newPassword, 12);

      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      // Log activity
      await prisma.activity.create({
        data: {
          userId,
          action: "PASSWORD_CHANGE",
          entity: "USER",
          entityId: userId,
        },
      });

      return {
        success: true,
        message: "Password changed successfully",
      };
    } catch (error) {
      logger.error("Change password error:", error);
      throw error;
    }
  }

  async demoLogin(): Promise<ApiResponse<AuthResponse>> {
    try {
      // Find or create demo user
      let user = await prisma.user.findUnique({
        where: { email: "demo@saasplatform.com" },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: "demo@saasplatform.com",
            name: "Demo User",
            password: await bcrypt.hash("Demo@123", 12),
          },
        });

        await prisma.subscription.create({
          data: {
            userId: user.id,
            plan: "PROFESSIONAL",
            status: "ACTIVE",
          },
        });
      }

      // Generate tokens
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const refreshToken = generateRefreshToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Save refresh token
      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      return {
        success: true,
        message: "Demo login successful",
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar || undefined,
          },
          token,
          refreshToken,
        },
      };
    } catch (error) {
      logger.error("Demo login error:", error);
      throw error;
    }
  }
}
