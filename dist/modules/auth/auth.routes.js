"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const validation_middleware_1 = require("../../shared/middleware/validation.middleware");
const auth_validation_1 = require("./auth.validation");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const router = (0, express_1.Router)();
const authController = new auth_controller_1.AuthController();
router.post("/register", (0, validation_middleware_1.validate)(auth_validation_1.registerSchema), authController.register);
router.post("/login", (0, validation_middleware_1.validate)(auth_validation_1.loginSchema), authController.login);
router.post("/social-login", (0, validation_middleware_1.validate)(auth_validation_1.socialLoginSchema), authController.socialLogin);
router.post("/demo-login", authController.demoLogin);
router.post("/refresh-token", authController.refreshToken);
router.post("/request-password-reset", (0, validation_middleware_1.validate)(auth_validation_1.resetPasswordSchema), authController.requestPasswordReset);
router.post("/reset-password", (0, validation_middleware_1.validate)(auth_validation_1.resetPasswordConfirmSchema), authController.resetPassword);
// Protected routes
router.post("/logout", auth_middleware_1.authenticate, authController.logout);
router.post("/change-password", auth_middleware_1.authenticate, (0, validation_middleware_1.validate)(auth_validation_1.changePasswordSchema), authController.changePassword);
router.get("/me", auth_middleware_1.authenticate, authController.me);
exports.authRoutes = router;
//# sourceMappingURL=auth.routes.js.map