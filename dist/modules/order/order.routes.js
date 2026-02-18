"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRoutes = void 0;
const express_1 = require("express");
const order_controller_1 = require("./order.controller");
const order_validation_1 = require("./order.validation");
const validation_middleware_1 = require("../../shared/middleware/validation.middleware");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const router = (0, express_1.Router)();
const orderController = new order_controller_1.OrderController();
// Public webhook (no authentication needed for Stripe)
router.post("/webhook", orderController.handleStripeWebhook);
// User routes
router.post("/", auth_middleware_1.authenticate, (0, validation_middleware_1.validate)(order_validation_1.createOrderSchema), orderController.createOrder);
router.get("/user", auth_middleware_1.authenticate, orderController.getUserOrders);
router.get("/stats", auth_middleware_1.authenticate, orderController.getOrderStats);
router.get("/:id", auth_middleware_1.authenticate, orderController.getOrderById);
router.get("/number/:orderNumber", auth_middleware_1.authenticate, orderController.getOrderByNumber);
router.post("/:id/cancel", auth_middleware_1.authenticate, orderController.cancelOrder);
router.post("/:id/checkout", auth_middleware_1.authenticate, orderController.createCheckoutSession);
// Admin routes
router.get("/", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), orderController.getOrders);
router.put("/:id/status", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), (0, validation_middleware_1.validate)(order_validation_1.updateOrderStatusSchema), orderController.updateOrderStatus);
exports.orderRoutes = router;
//# sourceMappingURL=order.routes.js.map