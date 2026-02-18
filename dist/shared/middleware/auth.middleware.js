"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenMiddleware = exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_status_codes_1 = require("http-status-codes");
const prisma_1 = require("../helpers/prisma");
const config_1 = require("../../config");
const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: 'Authentication required',
            });
            return; // Explicit return
        }
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.JWT_SECRET);
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                status: true,
                avatar: true,
            },
        });
        if (!user || user.status !== 'ACTIVE') {
            res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: 'User not found or inactive',
            });
            return; // Explicit return
        }
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
        };
        next();
    }
    catch (error) {
        res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: 'Invalid token',
        });
        return; // Explicit return
    }
};
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: 'Authentication required',
            });
            return; // Explicit return
        }
        if (!roles.includes(req.user.role)) {
            res.status(http_status_codes_1.StatusCodes.FORBIDDEN).json({
                success: false,
                message: 'Insufficient permissions',
            });
            return; // Explicit return
        }
        next();
    };
};
exports.authorize = authorize;
const refreshTokenMiddleware = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: 'Refresh token required',
            });
            return; // Explicit return
        }
        const tokenRecord = await prisma_1.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true },
        });
        if (!tokenRecord || tokenRecord.revoked || tokenRecord.expiresAt < new Date()) {
            res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: 'Invalid or expired refresh token',
            });
            return; // Explicit return
        }
        req.user = {
            id: tokenRecord.user.id,
            email: tokenRecord.user.email,
            role: tokenRecord.user.role,
        };
        next();
    }
    catch (error) {
        res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: 'Invalid refresh token',
        });
        return; // Explicit return
    }
};
exports.refreshTokenMiddleware = refreshTokenMiddleware;
//# sourceMappingURL=auth.middleware.js.map