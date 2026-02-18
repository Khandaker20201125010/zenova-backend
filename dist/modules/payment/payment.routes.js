"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRoutes = void 0;
const express_1 = require("express");
const payment_controller_1 = require("./payment.controller");
const validation_middleware_1 = require("../../shared/middleware/validation.middleware");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const payment_validation_1 = require("./payment.validation");
const router = (0, express_1.Router)();
const paymentController = new payment_controller_1.PaymentController();
// User routes
router.post("/intent", auth_middleware_1.authenticate, (0, validation_middleware_1.validate)(payment_validation_1.createPaymentSchema), paymentController.createPaymentIntent);
router.get("/user", auth_middleware_1.authenticate, paymentController.getPayments);
router.get("/stats", auth_middleware_1.authenticate, paymentController.getPaymentStats);
router.get("/:id", auth_middleware_1.authenticate, paymentController.getPaymentById);
// Admin routes
router.get("/", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), paymentController.getPayments);
router.put("/:id/status", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), paymentController.updatePaymentStatus);
router.post("/:id/refund", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), paymentController.refundPayment);
exports.paymentRoutes = router;
//# sourceMappingURL=payment.routes.js.map