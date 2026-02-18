"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsRoutes = void 0;
const express_1 = require("express");
const settings_controller_1 = require("./settings.controller");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const validation_middleware_1 = require("../../shared/middleware/validation.middleware");
const settings_validation_1 = require("./settings.validation");
const router = (0, express_1.Router)();
const settingsController = new settings_controller_1.SettingsController();
// Public routes
router.get("/public", settingsController.getPublicSettings);
// Admin routes
router.get("/", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), settingsController.getSettings);
router.get("/system", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), settingsController.getSystemSettings);
router.get("/:key", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), settingsController.getSetting);
router.put("/", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), settingsController.updateSetting);
router.put("/multiple", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), settingsController.updateMultipleSettings);
router.put("/system", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), (0, validation_middleware_1.validate)(settings_validation_1.updateSystemSettingsSchema), settingsController.updateSystemSettings);
router.post("/initialize", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), settingsController.initializeSettings);
exports.settingsRoutes = router;
//# sourceMappingURL=settings.routes.js.map