"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderController = void 0;
const http_status_codes_1 = require("http-status-codes");
const order_service_1 = require("./order.service");
const apiResponse_1 = require("../../shared/helpers/apiResponse");
const orderService = new order_service_1.OrderService();
class OrderController {
    async createOrder(req, res) {
        try {
            if (!req.user) {
                return res
                    .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
                    .json((0, apiResponse_1.errorResponse)("Authentication required"));
            }
            const result = await orderService.createOrder(req.user.id, req.body);
            if (!result.success) {
                return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json(result);
            }
            return res.status(http_status_codes_1.StatusCodes.CREATED).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to create order", error.message));
        }
    }
    async getOrders(req, res) {
        try {
            if (!req.user) {
                return res
                    .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
                    .json((0, apiResponse_1.errorResponse)("Authentication required"));
            }
            // Check if user is admin - if yes, return all orders
            const userId = req.user.role === "ADMIN" ? undefined : req.user.id;
            const result = await orderService.getOrders(req.query, userId);
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to get orders", error.message));
        }
    }
    async getOrderById(req, res) {
        try {
            if (!req.user) {
                return res
                    .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
                    .json((0, apiResponse_1.errorResponse)("Authentication required"));
            }
            // Fix: Handle string or string[] for id
            const id = Array.isArray(req.params.id)
                ? req.params.id[0]
                : req.params.id;
            // Check if user is admin or owns the order
            const userId = req.user.role === "ADMIN" ? undefined : req.user.id;
            const result = await orderService.getOrderById(id, userId);
            if (!result.success) {
                return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json(result);
            }
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to get order", error.message));
        }
    }
    async getOrderByNumber(req, res) {
        try {
            if (!req.user) {
                return res
                    .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
                    .json((0, apiResponse_1.errorResponse)("Authentication required"));
            }
            // Fix: Handle string or string[] for orderNumber
            const orderNumber = Array.isArray(req.params.orderNumber)
                ? req.params.orderNumber[0]
                : req.params.orderNumber;
            // Check if user is admin or owns the order
            const userId = req.user.role === "ADMIN" ? undefined : req.user.id;
            const result = await orderService.getOrderByNumber(orderNumber, userId);
            if (!result.success) {
                return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json(result);
            }
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to get order", error.message));
        }
    }
    async updateOrderStatus(req, res) {
        try {
            if (!req.user || req.user.role !== "ADMIN") {
                return res
                    .status(http_status_codes_1.StatusCodes.FORBIDDEN)
                    .json((0, apiResponse_1.errorResponse)("Insufficient permissions"));
            }
            // Fix: Handle string or string[] for id
            const id = Array.isArray(req.params.id)
                ? req.params.id[0]
                : req.params.id;
            const result = await orderService.updateOrderStatus(id, req.body);
            if (!result.success) {
                return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json(result);
            }
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to update order status", error.message));
        }
    }
    async cancelOrder(req, res) {
        try {
            if (!req.user) {
                return res
                    .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
                    .json((0, apiResponse_1.errorResponse)("Authentication required"));
            }
            // Fix: Handle string or string[] for id
            const id = Array.isArray(req.params.id)
                ? req.params.id[0]
                : req.params.id;
            const result = await orderService.cancelOrder(id, req.user.id);
            if (!result.success) {
                return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json(result);
            }
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to cancel order", error.message));
        }
    }
    async createCheckoutSession(req, res) {
        try {
            if (!req.user) {
                return res
                    .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
                    .json((0, apiResponse_1.errorResponse)("Authentication required"));
            }
            // Fix: Handle string or string[] for id
            const id = Array.isArray(req.params.id)
                ? req.params.id[0]
                : req.params.id;
            const result = await orderService.createCheckoutSession(id);
            if (!result.success) {
                return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json(result);
            }
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to create checkout session", error.message));
        }
    }
    async handleStripeWebhook(req, res) {
        try {
            const signature = req.headers["stripe-signature"];
            if (!signature) {
                return res
                    .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
                    .json((0, apiResponse_1.errorResponse)("Stripe signature required"));
            }
            const result = await orderService.handleStripeWebhook(req.body, signature);
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Webhook processing failed", error.message));
        }
    }
    async getOrderStats(req, res) {
        try {
            if (!req.user) {
                return res
                    .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
                    .json((0, apiResponse_1.errorResponse)("Authentication required"));
            }
            // Check if user is admin - if yes, return all stats
            const userId = req.user.role === "ADMIN" ? undefined : req.user.id;
            const result = await orderService.getOrderStats(userId);
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to get order stats", error.message));
        }
    }
    async getUserOrders(req, res) {
        try {
            if (!req.user) {
                return res
                    .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
                    .json((0, apiResponse_1.errorResponse)("Authentication required"));
            }
            const { page = 1, limit = 10 } = req.query;
            const result = await orderService.getUserOrders(req.user.id, parseInt(page), parseInt(limit));
            return res.status(http_status_codes_1.StatusCodes.OK).json(result);
        }
        catch (error) {
            return res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json((0, apiResponse_1.errorResponse)("Failed to get user orders", error.message));
        }
    }
}
exports.OrderController = OrderController;
//# sourceMappingURL=order.controller.js.map