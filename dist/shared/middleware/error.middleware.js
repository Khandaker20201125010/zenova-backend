"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = void 0;
const http_status_codes_1 = require("http-status-codes");
const zod_1 = require("zod");
const logger_1 = __importDefault(require("../helpers/logger"));
const errorHandler = (error, req, res) => {
    logger_1.default.error(`Error: ${error.message}`, {
        path: req.path,
        method: req.method,
        ip: req.ip,
        stack: error.stack,
    });
    // Zod validation error
    if (error instanceof zod_1.ZodError) {
        const errorDetails = error.errors || error.issues || [];
        return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Validation error',
            error: errorDetails.map((e) => ({
                field: e.path?.join('.') || e.field,
                message: e.message,
            })),
        });
    }
    // JWT error
    if (error.name === 'JsonWebTokenError') {
        return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: 'Invalid token',
        });
    }
    if (error.name === 'TokenExpiredError') {
        return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: 'Token expired',
        });
    }
    // Database errors
    if (error.name === 'PrismaClientKnownRequestError') {
        const prismaError = error;
        // Unique constraint violation
        if (prismaError.code === 'P2002') {
            return res.status(http_status_codes_1.StatusCodes.CONFLICT).json({
                success: false,
                message: `Duplicate value for ${prismaError.meta?.target?.join(', ')}`,
            });
        }
        // Record not found
        if (prismaError.code === 'P2025') {
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'Record not found',
            });
        }
    }
    // Default error
    return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res) => {
    res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
    });
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=error.middleware.js.map