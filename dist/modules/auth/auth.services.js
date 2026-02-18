"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../../shared/helpers/prisma");
const jwt_1 = require("../../shared/helpers/jwt");
const logger_1 = __importDefault(require("../../shared/helpers/logger"));
const email_1 = require("../../shared/helpers/email");
const crypto_1 = __importDefault(require("crypto"));
class AuthService {
    async register(data) {
        try {
            // Check if user already exists
            const existingUser = await prisma_1.prisma.user.findUnique({
                where: { email: data.email },
            });
            if (existingUser) {
                return {
                    success: false,
                    message: "Email already registered",
                };
            }
            // Hash password
            const hashedPassword = await bcryptjs_1.default.hash(data.password, 12);
            // Create user
            const user = await prisma_1.prisma.user.create({
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
            await prisma_1.prisma.subscription.create({
                data: {
                    userId: user.id,
                    plan: "FREE",
                    status: "ACTIVE",
                },
            });
            // Generate tokens
            const token = (0, jwt_1.generateToken)({
                userId: user.id,
                email: user.email,
                role: user.role,
            });
            const refreshToken = (0, jwt_1.generateRefreshToken)({
                userId: user.id,
                email: user.email,
                role: user.role,
            });
            // Save refresh token
            await prisma_1.prisma.refreshToken.create({
                data: {
                    token: refreshToken,
                    userId: user.id,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                },
            });
            // Log activity
            await prisma_1.prisma.activity.create({
                data: {
                    userId: user.id,
                    action: "REGISTER",
                    entity: "USER",
                    entityId: user.id,
                },
            });
            // Send welcome email
            try {
                await (0, email_1.sendWelcomeEmail)(user.email, user.name);
            }
            catch (emailError) {
                logger_1.default.error("Failed to send welcome email:", emailError);
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
        }
        catch (error) {
            logger_1.default.error("Registration error:", error);
            throw error;
        }
    }
    async login(data) {
        try {
            // Find user
            const user = await prisma_1.prisma.user.findUnique({
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
            const isValidPassword = await bcryptjs_1.default.compare(data.password, user.password);
            if (!isValidPassword) {
                return {
                    success: false,
                    message: "Invalid credentials",
                };
            }
            // Update last login
            await prisma_1.prisma.user.update({
                where: { id: user.id },
                data: { lastLoginAt: new Date() },
            });
            // Generate tokens
            const token = (0, jwt_1.generateToken)({
                userId: user.id,
                email: user.email,
                role: user.role,
            });
            const refreshToken = (0, jwt_1.generateRefreshToken)({
                userId: user.id,
                email: user.email,
                role: user.role,
            });
            // Save refresh token
            await prisma_1.prisma.refreshToken.create({
                data: {
                    token: refreshToken,
                    userId: user.id,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                },
            });
            // Log activity
            await prisma_1.prisma.activity.create({
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
        }
        catch (error) {
            logger_1.default.error("Login error:", error);
            throw error;
        }
    }
    async socialLogin(data) {
        try {
            let user;
            // Check if user exists by email
            user = await prisma_1.prisma.user.findUnique({
                where: { email: data.email },
            });
            if (!user) {
                // Create new user
                user = await prisma_1.prisma.user.create({
                    data: {
                        email: data.email,
                        name: data.name,
                        password: await bcryptjs_1.default.hash(crypto_1.default.randomBytes(32).toString("hex"), 12), // Random password
                        googleId: data.googleId,
                        facebookId: data.facebookId,
                        avatar: data.avatar,
                        emailVerified: true,
                        emailVerifiedAt: new Date(),
                    },
                });
                // Create subscription
                await prisma_1.prisma.subscription.create({
                    data: {
                        userId: user.id,
                        plan: "FREE",
                        status: "ACTIVE",
                    },
                });
            }
            else {
                // Update social IDs if not set
                await prisma_1.prisma.user.update({
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
            const token = (0, jwt_1.generateToken)({
                userId: user.id,
                email: user.email,
                role: user.role,
            });
            const refreshToken = (0, jwt_1.generateRefreshToken)({
                userId: user.id,
                email: user.email,
                role: user.role,
            });
            // Save refresh token
            await prisma_1.prisma.refreshToken.create({
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
        }
        catch (error) {
            logger_1.default.error("Social login error:", error);
            throw error;
        }
    }
    async refreshToken(refreshToken) {
        try {
            const tokenRecord = await prisma_1.prisma.refreshToken.findUnique({
                where: { token: refreshToken },
                include: { user: true },
            });
            if (!tokenRecord ||
                tokenRecord.revoked ||
                tokenRecord.expiresAt < new Date()) {
                return {
                    success: false,
                    message: "Invalid refresh token",
                };
            }
            // Generate new tokens
            const newToken = (0, jwt_1.generateToken)({
                userId: tokenRecord.user.id,
                email: tokenRecord.user.email,
                role: tokenRecord.user.role,
            });
            const newRefreshToken = (0, jwt_1.generateRefreshToken)({
                userId: tokenRecord.user.id,
                email: tokenRecord.user.email,
                role: tokenRecord.user.role,
            });
            // Revoke old token
            await prisma_1.prisma.refreshToken.update({
                where: { id: tokenRecord.id },
                data: { revoked: true },
            });
            // Save new refresh token
            await prisma_1.prisma.refreshToken.create({
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
        }
        catch (error) {
            logger_1.default.error("Refresh token error:", error);
            throw error;
        }
    }
    async logout(refreshToken, userId) {
        try {
            // Revoke refresh token
            await prisma_1.prisma.refreshToken.updateMany({
                where: { token: refreshToken, userId },
                data: { revoked: true },
            });
            // Log activity
            await prisma_1.prisma.activity.create({
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
        }
        catch (error) {
            logger_1.default.error("Logout error:", error);
            throw error;
        }
    }
    async requestPasswordReset(email) {
        try {
            const user = await prisma_1.prisma.user.findUnique({
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
            const resetToken = (0, jwt_1.generateToken)({
                userId: user.id,
                email: user.email,
                role: user.role,
            });
            // Send reset email
            await (0, email_1.sendPasswordResetEmail)(email, resetToken);
            // Log activity
            await prisma_1.prisma.activity.create({
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
        }
        catch (error) {
            logger_1.default.error("Password reset request error:", error);
            throw error;
        }
    }
    async resetPassword(token, newPassword) {
        try {
            let decoded;
            try {
                decoded = (0, jwt_1.verifyToken)(token); // FIX: Use verifyToken instead of generateToken
            }
            catch (error) {
                return {
                    success: false,
                    message: "Invalid or expired token",
                };
            }
            const hashedPassword = await bcryptjs_1.default.hash(newPassword, 12);
            await prisma_1.prisma.user.update({
                where: { id: decoded.userId },
                data: { password: hashedPassword },
            });
            // Log activity
            await prisma_1.prisma.activity.create({
                data: {
                    userId: decoded.userId,
                    action: "PASSWORD_RESET",
                    entity: "USER",
                    entityId: decoded.userId,
                },
            });
            // Revoke all refresh tokens
            await prisma_1.prisma.refreshToken.updateMany({
                where: { userId: decoded.userId },
                data: { revoked: true },
            });
            return {
                success: true,
                message: "Password reset successful",
            };
        }
        catch (error) {
            logger_1.default.error("Password reset error:", error);
            throw error;
        }
    }
    async changePassword(userId, data) {
        try {
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                return {
                    success: false,
                    message: "User not found",
                };
            }
            // Verify current password
            const isValid = await bcryptjs_1.default.compare(data.currentPassword, user.password);
            if (!isValid) {
                return {
                    success: false,
                    message: "Current password is incorrect",
                };
            }
            // Update password
            const hashedPassword = await bcryptjs_1.default.hash(data.newPassword, 12);
            await prisma_1.prisma.user.update({
                where: { id: userId },
                data: { password: hashedPassword },
            });
            // Log activity
            await prisma_1.prisma.activity.create({
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
        }
        catch (error) {
            logger_1.default.error("Change password error:", error);
            throw error;
        }
    }
    async demoLogin() {
        try {
            // Find or create demo user
            let user = await prisma_1.prisma.user.findUnique({
                where: { email: "demo@saasplatform.com" },
            });
            if (!user) {
                user = await prisma_1.prisma.user.create({
                    data: {
                        email: "demo@saasplatform.com",
                        name: "Demo User",
                        password: await bcryptjs_1.default.hash("Demo@123", 12),
                    },
                });
                await prisma_1.prisma.subscription.create({
                    data: {
                        userId: user.id,
                        plan: "PROFESSIONAL",
                        status: "ACTIVE",
                    },
                });
            }
            // Generate tokens
            const token = (0, jwt_1.generateToken)({
                userId: user.id,
                email: user.email,
                role: user.role,
            });
            const refreshToken = (0, jwt_1.generateRefreshToken)({
                userId: user.id,
                email: user.email,
                role: user.role,
            });
            // Save refresh token
            await prisma_1.prisma.refreshToken.create({
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
        }
        catch (error) {
            logger_1.default.error("Demo login error:", error);
            throw error;
        }
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.services.js.map