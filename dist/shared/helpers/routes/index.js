"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = require("../../../modules/auth/auth.routes");
const user_routes_1 = require("../../../modules/user/user.routes");
const product_routes_1 = require("../../../modules/product/product.routes");
const order_routes_1 = require("../../../modules/order/order.routes");
const payment_routes_1 = require("../../../modules/payment/payment.routes");
const notification_routes_1 = __importDefault(require("../../../modules/notification/notification.routes"));
const contact_routes_1 = require("../../../modules/contact/contact.routes");
const blog_routes_1 = require("../../../modules/blog/blog.routes");
const category_routes_1 = require("../../../modules/category/category.routes");
const review_routes_1 = require("../../../modules/review/review.routes");
const settings_routes_1 = require("../../../modules/settings/settings.routes");
const dashboard_routes_1 = require("../../../modules/dashboard/dashboard.routes");
// import other feature routes
const router = (0, express_1.Router)();
router.use("/auth", auth_routes_1.authRoutes);
router.use("/users", user_routes_1.userRoutes);
router.use("/products", product_routes_1.productRoutes);
router.use("/orders", order_routes_1.orderRoutes);
router.use("/payments", payment_routes_1.paymentRoutes);
router.use("/notifications", notification_routes_1.default);
router.use("/contacts", contact_routes_1.contactRoutes);
router.use("/blog", blog_routes_1.blogRoutes);
router.use("/categories", category_routes_1.categoryRoutes);
router.use("/reviews", review_routes_1.reviewRoutes);
router.use("settings", settings_routes_1.settingsRoutes);
router.use("dashboard", dashboard_routes_1.dashboardRoutes);
// use other feature routes
exports.default = router;
//# sourceMappingURL=index.js.map