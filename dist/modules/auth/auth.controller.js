"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const http_status_codes_1 = require("http-status-codes");
const auth_services_1 = require("./auth.services");
const apiResponse_1 = require("../../shared/helpers/apiResponse");
const prisma_1 = require("../../shared/helpers/prisma");
const authService = new auth_services_1.AuthService();
class AuthController {
    async register(req, res) {
        try {
            const result = await authService.register(req.body);
            if (!result.success) {
                return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json(result);
            }
            // Set refresh token as HTTP-only cookie
            res.cookie("refreshToken", result.data?.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });
            return res.status(http_status_codes_1.StatusCodes.CREATED).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Registration failed", error.message));
        }
    }
    async login(req, res) {
        try {
            const result = await authService.login(req.body);
            if (!result.success) {
                return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json(result);
            }
            // Set refresh token as HTTP-only cookie
            res.cookie("refreshToken", result.data?.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Login failed", error.message));
        }
    }
    async socialLogin(req, res) {
        try {
            const result = await authService.socialLogin(req.body);
            if (!result.success) {
                return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json(result);
            }
            res.cookie("refreshToken", result.data?.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Social login failed", error.message));
        }
    }
    async refreshToken(req, res) {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                return res
                    .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
                    .json((0, apiResponse_1.errorResponse)("Refresh token is required"));
            }
            const result = await authService.refreshToken(refreshToken);
            if (!result.success) {
                return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json(result);
            }
            // Set new refresh token as HTTP-only cookie
            res.cookie("refreshToken", result.data?.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Token refresh failed", error.message));
        }
    }
    async logout(req, res) {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken || !req.user) {
                return res
                    .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
                    .json((0, apiResponse_1.errorResponse)("Invalid request"));
            }
            const result = await authService.logout(refreshToken, req.user.id);
            // Clear refresh token cookie
            res.clearCookie("refreshToken");
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Logout failed", error.message));
        }
    }
    async requestPasswordReset(req, res) {
        try {
            const { email } = req.body;
            const result = await authService.requestPasswordReset(email);
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Password reset request failed", error.message));
        }
    }
    async resetPassword(req, res) {
        try {
            const { token, password } = req.body;
            const result = await authService.resetPassword(token, password);
            if (!result.success) {
                return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json(result);
            }
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Password reset failed", error.message));
        }
    }
    async changePassword(req, res) {
        try {
            if (!req.user) {
                return res
                    .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
                    .json((0, apiResponse_1.errorResponse)("Authentication required"));
            }
            const result = await authService.changePassword(req.user.id, req.body);
            if (!result.success) {
                return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json(result);
            }
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Password change failed", error.message));
        }
    }
    async demoLogin(req, res) {
        try {
            const result = await authService.demoLogin();
            if (!result.success) {
                return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json(result);
            }
            res.cookie("refreshToken", result.data?.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Demo login failed", error.message));
        }
    }
    async me(req, res) {
        try {
            if (!req.user) {
                return res
                    .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
                    .json((0, apiResponse_1.errorResponse)("Authentication required"));
            }
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: req.user.id },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    avatar: true,
                    role: true,
                    status: true,
                    phone: true,
                    company: true,
                    position: true,
                    bio: true,
                    emailVerified: true,
                    twoFactorEnabled: true,
                    lastLoginAt: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
            if (!user) {
                return res
                    .status(http_status_codes_1.StatusCodes.NOT_FOUND)
                    .json((0, apiResponse_1.errorResponse)("User not found"));
            }
            return res
                .status(http_status_codes_1.StatusCodes.OK)
                .json((0, apiResponse_1.successResponse)("User retrieved successfully", user));
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to get user", error.message));
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map