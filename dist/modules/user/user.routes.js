"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const user_validation_1 = require("./user.validation");
const validation_middleware_1 = require("../../shared/middleware/validation.middleware");
const upload_middleware_1 = require("../../shared/middleware/upload.middleware");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const router = (0, express_1.Router)();
const userController = new user_controller_1.UserController();
// User profile routes (authenticated)
router.get("/profile", auth_middleware_1.authenticate, userController.getProfile);
router.put("/profile", auth_middleware_1.authenticate, (0, validation_middleware_1.validate)(user_validation_1.updateProfileSchema), userController.updateProfile);
router.put("/email", auth_middleware_1.authenticate, (0, validation_middleware_1.validate)(user_validation_1.updateEmailSchema), userController.updateEmail);
router.put("/two-factor", auth_middleware_1.authenticate, (0, validation_middleware_1.validate)(user_validation_1.toggleTwoFactorSchema), userController.toggleTwoFactor);
router.post("/avatar", auth_middleware_1.authenticate, upload_middleware_1.uploadMiddleware.single("avatar"), userController.uploadAvatar);
router.get("/stats", auth_middleware_1.authenticate, userController.getUserStats);
router.get("/activities", auth_middleware_1.authenticate, userController.getActivities);
// Admin routes
router.get("/", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), userController.getUsers);
router.get("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), userController.getUserById);
router.put("/:id/status", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), userController.updateUserStatus);
router.put("/:id/role", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), userController.updateUserRole);
router.delete("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), userController.deleteUser);
exports.userRoutes = router;
//# sourceMappingURL=user.routes.js.map