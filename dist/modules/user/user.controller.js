"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const http_status_codes_1 = require("http-status-codes");
const user_service_1 = require("./user.service");
const apiResponse_1 = require("../../shared/helpers/apiResponse");
const userService = new user_service_1.UserService();
class UserController {
    async getProfile(req, res) {
        try {
            if (!req.user) {
                return res
                    .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
                    .json((0, apiResponse_1.errorMessageResponse)("Authentication required"));
            }
            const result = await userService.getProfile(req.user.id);
            if (!result.success) {
                return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json(result);
            }
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to get profile", (0, apiResponse_1.getErrorMessage)(error)));
        }
    }
    async updateProfile(req, res) {
        try {
            if (!req.user) {
                return res
                    .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
                    .json((0, apiResponse_1.errorMessageResponse)("Authentication required"));
            }
            const result = await userService.updateProfile(req.user.id, req.body);
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to update profile", (0, apiResponse_1.getErrorMessage)(error)));
        }
    }
    async updateEmail(req, res) {
        try {
            if (!req.user) {
                return res
                    .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
                    .json((0, apiResponse_1.errorMessageResponse)("Authentication required"));
            }
            const result = await userService.updateEmail(req.user.id, req.body);
            if (!result.success) {
                return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json(result);
            }
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to update email", (0, apiResponse_1.getErrorMessage)(error)));
        }
    }
    async toggleTwoFactor(req, res) {
        try {
            if (!req.user) {
                return res
                    .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
                    .json((0, apiResponse_1.errorMessageResponse)("Authentication required"));
            }
            const result = await userService.toggleTwoFactor(req.user.id, req.body);
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to toggle two-factor authentication", (0, apiResponse_1.getErrorMessage)(error)));
        }
    }
    async uploadAvatar(req, res) {
        try {
            if (!req.user) {
                return res
                    .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
                    .json((0, apiResponse_1.errorMessageResponse)("Authentication required"));
            }
            if (!req.file) {
                return res
                    .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
                    .json((0, apiResponse_1.errorMessageResponse)("No file uploaded"));
            }
            // Debug: Log what's in req.file
            console.log("req.file:", req.file);
            console.log("req.file keys:", Object.keys(req.file));
            // Try different ways to get the URL
            const file = req.file;
            console.log("file.secure_url:", file.secure_url);
            console.log("file.url:", file.url);
            console.log("file.path:", file.path);
            console.log("file.location:", file.location);
            console.log("All properties:", file);
            // Try to get the URL from different possible properties
            const avatarUrl = file.secure_url || file.url || file.path || file.location;
            if (!avatarUrl) {
                return res
                    .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
                    .json((0, apiResponse_1.errorResponse)("Failed to get image URL from upload"));
            }
            const result = await userService.uploadAvatar(req.user.id, avatarUrl);
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            console.error("Upload avatar error:", error);
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to upload avatar", (0, apiResponse_1.getErrorMessage)(error)));
        }
    }
    async getUsers(req, res) {
        try {
            if (!req.user || req.user.role !== "ADMIN") {
                return res
                    .status(http_status_codes_1.StatusCodes.FORBIDDEN)
                    .json((0, apiResponse_1.errorMessageResponse)("Insufficient permissions"));
            }
            // Parse query parameters
            const queryParams = {
                page: req.query.page ? parseInt(req.query.page) : undefined,
                limit: req.query.limit
                    ? parseInt(req.query.limit)
                    : undefined,
                search: req.query.search,
                role: req.query.role,
                status: req.query.status,
                sortBy: req.query.sortBy,
                sortOrder: req.query.sortOrder,
            };
            const result = await userService.getUsers(queryParams);
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to get users", (0, apiResponse_1.getErrorMessage)(error)));
        }
    }
    async getUserById(req, res) {
        try {
            // Get the ID as string
            const userId = Array.isArray(req.params.id)
                ? req.params.id[0]
                : req.params.id;
            if (!req.user || (req.user.role !== "ADMIN" && req.user.id !== userId)) {
                return res
                    .status(http_status_codes_1.StatusCodes.FORBIDDEN)
                    .json((0, apiResponse_1.errorMessageResponse)("Insufficient permissions"));
            }
            const result = await userService.getUserById(userId);
            if (!result.success) {
                return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json(result);
            }
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to get user", (0, apiResponse_1.getErrorMessage)(error)));
        }
    }
    async updateUserStatus(req, res) {
        try {
            if (!req.user || req.user.role !== "ADMIN") {
                return res
                    .status(http_status_codes_1.StatusCodes.FORBIDDEN)
                    .json((0, apiResponse_1.errorMessageResponse)("Insufficient permissions"));
            }
            const { status } = req.body;
            const userId = Array.isArray(req.params.id)
                ? req.params.id[0]
                : req.params.id;
            const result = await userService.updateUserStatus(userId, status);
            if (!result.success) {
                return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json(result);
            }
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to update user status", (0, apiResponse_1.getErrorMessage)(error)));
        }
    }
    async updateUserRole(req, res) {
        try {
            if (!req.user || req.user.role !== "ADMIN") {
                return res
                    .status(http_status_codes_1.StatusCodes.FORBIDDEN)
                    .json((0, apiResponse_1.errorMessageResponse)("Insufficient permissions"));
            }
            const { role } = req.body;
            const userId = Array.isArray(req.params.id)
                ? req.params.id[0]
                : req.params.id;
            const result = await userService.updateUserRole(userId, role);
            if (!result.success) {
                return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json(result);
            }
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to update user role", (0, apiResponse_1.getErrorMessage)(error)));
        }
    }
    async deleteUser(req, res) {
        try {
            if (!req.user || req.user.role !== "ADMIN") {
                return res
                    .status(http_status_codes_1.StatusCodes.FORBIDDEN)
                    .json((0, apiResponse_1.errorMessageResponse)("Insufficient permissions"));
            }
            // Get the ID as string
            const userId = Array.isArray(req.params.id)
                ? req.params.id[0]
                : req.params.id;
            // Prevent deleting own account
            if (req.user.id === userId) {
                return res
                    .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
                    .json((0, apiResponse_1.errorMessageResponse)("Cannot delete your own account"));
            }
            const result = await userService.deleteUser(userId);
            if (!result.success) {
                return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json(result);
            }
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to delete user", (0, apiResponse_1.getErrorMessage)(error)));
        }
    }
    async getUserStats(req, res) {
        try {
            if (!req.user) {
                return res
                    .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
                    .json((0, apiResponse_1.errorMessageResponse)("Authentication required"));
            }
            const result = await userService.getUserStats(req.user.id);
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to get user stats", (0, apiResponse_1.getErrorMessage)(error)));
        }
    }
    async getActivities(req, res) {
        try {
            if (!req.user) {
                return res
                    .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
                    .json((0, apiResponse_1.errorMessageResponse)("Authentication required"));
            }
            const page = req.query.page ? parseInt(req.query.page) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit) : 20;
            const result = await userService.getActivities(req.user.id, page, limit);
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to get activities", (0, apiResponse_1.getErrorMessage)(error)));
        }
    }
}
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map