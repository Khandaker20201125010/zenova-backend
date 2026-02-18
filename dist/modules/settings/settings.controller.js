"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsController = void 0;
const http_status_codes_1 = require("http-status-codes");
const settings_service_1 = require("./settings.service");
const apiResponse_1 = require("../../shared/helpers/apiResponse");
const settingsService = new settings_service_1.SettingsService();
class SettingsController {
    async getSettings(req, res) {
        try {
            if (!req.user || req.user.role !== "ADMIN") {
                return res
                    .status(http_status_codes_1.StatusCodes.FORBIDDEN)
                    .json((0, apiResponse_1.errorResponse)("Insufficient permissions"));
            }
            const result = await settingsService.getSettings();
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to get settings", error.message));
        }
    }
    async getSetting(req, res) {
        try {
            if (!req.user || req.user.role !== "ADMIN") {
                return res
                    .status(http_status_codes_1.StatusCodes.FORBIDDEN)
                    .json((0, apiResponse_1.errorResponse)("Insufficient permissions"));
            }
            // Fix: Handle string or string[] for key
            const key = Array.isArray(req.params.key)
                ? req.params.key[0]
                : req.params.key;
            const result = await settingsService.getSetting(key);
            if (!result.success) {
                return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json(result);
            }
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to get setting", error.message));
        }
    }
    async updateSetting(req, res) {
        try {
            if (!req.user || req.user.role !== "ADMIN") {
                return res
                    .status(http_status_codes_1.StatusCodes.FORBIDDEN)
                    .json((0, apiResponse_1.errorResponse)("Insufficient permissions"));
            }
            const { key, value, type } = req.body;
            const result = await settingsService.updateSetting(key, value, type);
            if (!result.success) {
                return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json(result);
            }
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to update setting", error.message));
        }
    }
    async updateMultipleSettings(req, res) {
        try {
            if (!req.user || req.user.role !== "ADMIN") {
                return res
                    .status(http_status_codes_1.StatusCodes.FORBIDDEN)
                    .json((0, apiResponse_1.errorResponse)("Insufficient permissions"));
            }
            const result = await settingsService.updateMultipleSettings(req.body);
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to update settings", error.message));
        }
    }
    async getSystemSettings(req, res) {
        try {
            if (!req.user || req.user.role !== "ADMIN") {
                return res
                    .status(http_status_codes_1.StatusCodes.FORBIDDEN)
                    .json((0, apiResponse_1.errorResponse)("Insufficient permissions"));
            }
            const result = await settingsService.getSystemSettings();
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to get system settings", error.message));
        }
    }
    async updateSystemSettings(req, res) {
        try {
            if (!req.user || req.user.role !== "ADMIN") {
                return res
                    .status(http_status_codes_1.StatusCodes.FORBIDDEN)
                    .json((0, apiResponse_1.errorResponse)("Insufficient permissions"));
            }
            const result = await settingsService.updateSystemSettings(req.body);
            if (!result.success) {
                return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json(result);
            }
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to update system settings", error.message));
        }
    }
    async getPublicSettings(req, res) {
        try {
            const result = await settingsService.getPublicSettings();
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to get public settings", error.message));
        }
    }
    async initializeSettings(req, res) {
        try {
            if (!req.user || req.user.role !== "ADMIN") {
                return res
                    .status(http_status_codes_1.StatusCodes.FORBIDDEN)
                    .json((0, apiResponse_1.errorResponse)("Insufficient permissions"));
            }
            const defaultSettings = {
                "site.name": "SaaS Platform",
                "site.description": "Professional SaaS/Business Platform",
                "site.logo": "/logo.png",
                "site.favicon": "/favicon.ico",
                "site.theme": "light",
                "site.language": "en",
                "site.timezone": "UTC",
                "site.currency": "USD",
                "email.enabled": true,
                "email.fromName": "SaaS Platform",
                "email.fromEmail": "noreply@saasplatform.com",
                "payment.stripeEnabled": false,
                "payment.currency": "usd",
                "storage.provider": "cloudinary",
                "features.enableBlog": true,
                "features.enableReviews": true,
                "features.enableNotifications": true,
                "features.enableTwoFactor": false,
                "security.requireEmailVerification": false,
                "security.requireStrongPasswords": true,
                "security.maxLoginAttempts": 5,
                "security.sessionTimeout": 24,
            };
            const result = await settingsService.updateMultipleSettings(defaultSettings);
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to initialize settings", error.message));
        }
    }
}
exports.SettingsController = SettingsController;
//# sourceMappingURL=settings.controller.js.map