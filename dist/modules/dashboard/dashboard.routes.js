"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const dashboard_controller_1 = require("./dashboard.controller");
const validation_middleware_1 = require("../../shared/middleware/validation.middleware");
const dashboard_validation_1 = require("./dashboard.validation");
const router = (0, express_1.Router)();
const dashboardController = new dashboard_controller_1.DashboardController();
// User dashboard
router.get("/user", auth_middleware_1.authenticate, dashboardController.getUserDashboard);
// Manager dashboard
router.get("/manager", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN", "MANAGER"), dashboardController.getManagerDashboard);
// Admin dashboards
router.get("/admin", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), dashboardController.getAdminDashboard);
router.get("/analytics", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), (0, validation_middleware_1.validate)(dashboard_validation_1.analyticsQuerySchema), dashboardController.getAnalytics);
router.get("/analytics/revenue", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), dashboardController.getRevenueAnalytics);
router.get("/analytics/users", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), dashboardController.getUserAnalytics);
router.get("/analytics/sales", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN", "MANAGER"), dashboardController.getSalesAnalytics);
router.get("/system-status", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), dashboardController.getSystemStatus);
exports.dashboardRoutes = router;
//# sourceMappingURL=dashboard.routes.js.map