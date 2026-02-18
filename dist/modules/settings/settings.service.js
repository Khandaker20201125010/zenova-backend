"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const logger_1 = __importDefault(require("../../shared/helpers/logger"));
const prisma_1 = require("../../shared/helpers/prisma");
class SettingsService {
    async getSettings() {
        try {
            const settings = await prisma_1.prisma.setting.findMany();
            // Transform to key-value object
            const settingsObject = settings.reduce((acc, setting) => {
                acc[setting.key] = {
                    value: setting.value,
                    type: setting.type,
                };
                return acc;
            }, {});
            return {
                success: true,
                message: "Settings retrieved successfully",
                data: settingsObject,
            };
        }
        catch (error) {
            logger_1.default.error("Get settings error:", error);
            throw error;
        }
    }
    async getSetting(key) {
        try {
            const setting = await prisma_1.prisma.setting.findUnique({
                where: { key },
            });
            if (!setting) {
                return {
                    success: false,
                    message: "Setting not found",
                };
            }
            return {
                success: true,
                message: "Setting retrieved successfully",
                data: setting,
            };
        }
        catch (error) {
            logger_1.default.error("Get setting error:", error);
            throw error;
        }
    }
    async updateSetting(key, value, type = "string") {
        try {
            const setting = await prisma_1.prisma.setting.upsert({
                where: { key },
                update: { value, type },
                create: { key, value, type },
            });
            return {
                success: true,
                message: "Setting updated successfully",
                data: setting,
            };
        }
        catch (error) {
            logger_1.default.error("Update setting error:", error);
            throw error;
        }
    }
    async updateMultipleSettings(data) {
        try {
            const updates = Object.entries(data).map(([key, value]) => {
                return prisma_1.prisma.setting.upsert({
                    where: { key },
                    update: { value },
                    create: { key, value, type: typeof value },
                });
            });
            const updatedSettings = await prisma_1.prisma.$transaction(updates);
            return {
                success: true,
                message: "Settings updated successfully",
                data: updatedSettings,
            };
        }
        catch (error) {
            logger_1.default.error("Update multiple settings error:", error);
            throw error;
        }
    }
    async getSystemSettings() {
        try {
            const defaultSettings = {
                site: {
                    name: "SaaS Platform",
                    description: "Professional SaaS/Business Platform",
                    logo: "/logo.png",
                    favicon: "/favicon.ico",
                    theme: "light",
                    language: "en",
                    timezone: "UTC",
                    currency: "USD",
                },
                email: {
                    enabled: true,
                    fromName: "SaaS Platform",
                    fromEmail: "noreply@saasplatform.com",
                    smtpHost: "",
                    smtpPort: 587,
                    smtpUser: "",
                    smtpPass: "",
                },
                payment: {
                    stripeEnabled: true,
                    stripePublicKey: "",
                    stripeSecretKey: "",
                    currency: "usd",
                },
                storage: {
                    provider: "cloudinary",
                    cloudinaryCloudName: "",
                    cloudinaryApiKey: "",
                    cloudinaryApiSecret: "",
                },
                social: {
                    facebook: "",
                    twitter: "",
                    instagram: "",
                    linkedin: "",
                    github: "",
                },
                analytics: {
                    googleAnalyticsId: "",
                    facebookPixelId: "",
                },
                security: {
                    requireEmailVerification: false,
                    requireStrongPasswords: true,
                    maxLoginAttempts: 5,
                    sessionTimeout: 24,
                },
                features: {
                    enableBlog: true,
                    enableReviews: true,
                    enableNotifications: true,
                    enableTwoFactor: false,
                },
            };
            // Get from database
            const dbSettings = await prisma_1.prisma.setting.findMany();
            // Merge with defaults
            dbSettings.forEach((setting) => {
                const keys = setting.key.split(".");
                let current = defaultSettings;
                for (let i = 0; i < keys.length - 1; i++) {
                    if (!current[keys[i]]) {
                        current[keys[i]] = {};
                    }
                    current = current[keys[i]];
                }
                current[keys[keys.length - 1]] = setting.value;
            });
            return {
                success: true,
                message: "System settings retrieved successfully",
                data: defaultSettings,
            };
        }
        catch (error) {
            logger_1.default.error("Get system settings error:", error);
            throw error;
        }
    }
    async updateSystemSettings(data) {
        try {
            // Flatten nested object
            const flattened = {};
            const flatten = (obj, prefix = "") => {
                for (const key in obj) {
                    if (typeof obj[key] === "object" && obj[key] !== null) {
                        flatten(obj[key], `${prefix}${key}.`);
                    }
                    else {
                        flattened[`${prefix}${key}`] = obj[key];
                    }
                }
            };
            flatten(data);
            // Update in database
            const updates = Object.entries(flattened).map(([key, value]) => {
                return prisma_1.prisma.setting.upsert({
                    where: { key },
                    update: { value, type: typeof value },
                    create: { key, value, type: typeof value },
                });
            });
            await prisma_1.prisma.$transaction(updates);
            return {
                success: true,
                message: "System settings updated successfully",
            };
        }
        catch (error) {
            logger_1.default.error("Update system settings error:", error);
            throw error;
        }
    }
    async getPublicSettings() {
        try {
            const publicSettings = await prisma_1.prisma.setting.findMany({
                where: {
                    key: {
                        in: [
                            "site.name",
                            "site.description",
                            "site.logo",
                            "site.theme",
                            "site.currency",
                            "social.facebook",
                            "social.twitter",
                            "social.instagram",
                            "social.linkedin",
                            "contact.email",
                            "contact.phone",
                            "contact.address",
                        ],
                    },
                },
            });
            const settingsObject = publicSettings.reduce((acc, setting) => {
                acc[setting.key] = setting.value;
                return acc;
            }, {});
            return {
                success: true,
                message: "Public settings retrieved successfully",
                data: settingsObject,
            };
        }
        catch (error) {
            logger_1.default.error("Get public settings error:", error);
            throw error;
        }
    }
}
exports.SettingsService = SettingsService;
//# sourceMappingURL=settings.service.js.map