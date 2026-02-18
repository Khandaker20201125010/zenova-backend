"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const stripe_1 = require("../../config/stripe");
const logger_1 = __importDefault(require("../../shared/helpers/logger"));
const prisma_1 = require("../../shared/helpers/prisma");
const client_1 = require("@prisma/client"); // Import the enum
class PaymentService {
    async createPaymentIntent(userId, data) {
        try {
            const paymentIntent = await stripe_1.stripe.paymentIntents.create({
                amount: Math.round(data.amount * 100),
                currency: data.currency || "usd",
                metadata: {
                    userId,
                    orderId: data.orderId || "",
                    description: data.description || "",
                },
            });
            // Create payment record
            const payment = await prisma_1.prisma.payment.create({
                data: {
                    userId,
                    amount: data.amount,
                    currency: data.currency || "usd",
                    status: client_1.PaymentStatus.PENDING, // Use enum
                    stripePaymentId: paymentIntent.id,
                    description: data.description,
                },
            });
            return {
                success: true,
                message: "Payment intent created",
                data: {
                    payment,
                    clientSecret: paymentIntent.client_secret,
                },
            };
        }
        catch (error) {
            // Fix error type
            logger_1.default.error("Create payment intent error:", error);
            throw error;
        }
    }
    async getPayments(params, userId) {
        try {
            const { page = 1, limit = 10, status, startDate, endDate, sortBy = "createdAt", sortOrder = "desc", } = params;
            const skip = (page - 1) * limit;
            // Build where clause
            const where = {};
            if (userId) {
                where.userId = userId;
            }
            if (status) {
                // Validate status is a valid PaymentStatus enum
                if (Object.values(client_1.PaymentStatus).includes(status)) {
                    where.status = status;
                }
                else {
                    return {
                        success: false,
                        message: `Invalid status. Must be one of: ${Object.values(client_1.PaymentStatus).join(", ")}`,
                    };
                }
            }
            if (startDate || endDate) {
                where.createdAt = {};
                if (startDate)
                    where.createdAt.gte = new Date(startDate);
                if (endDate)
                    where.createdAt.lte = new Date(endDate);
            }
            // Get payments
            const [payments, total] = await Promise.all([
                prisma_1.prisma.payment.findMany({
                    where,
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                    skip,
                    take: limit,
                    orderBy: { [sortBy]: sortOrder },
                }),
                prisma_1.prisma.payment.count({ where }),
            ]);
            const totalPages = Math.ceil(total / limit);
            return {
                success: true,
                message: "Payments retrieved successfully",
                data: payments,
                meta: {
                    page,
                    limit,
                    total,
                    totalPages,
                },
            };
        }
        catch (error) {
            // Fix error type
            logger_1.default.error("Get payments error:", error);
            throw error;
        }
    }
    async getPaymentById(id, userId) {
        try {
            const where = { id };
            if (userId) {
                where.userId = userId;
            }
            const payment = await prisma_1.prisma.payment.findUnique({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });
            if (!payment) {
                return {
                    success: false,
                    message: "Payment not found",
                };
            }
            return {
                success: true,
                message: "Payment retrieved successfully",
                data: payment,
            };
        }
        catch (error) {
            // Fix error type
            logger_1.default.error("Get payment by ID error:", error);
            throw error;
        }
    }
    async updatePaymentStatus(id, status) {
        try {
            // Validate status is a valid PaymentStatus enum
            if (!Object.values(client_1.PaymentStatus).includes(status)) {
                return {
                    success: false,
                    message: `Invalid status. Must be one of: ${Object.values(client_1.PaymentStatus).join(", ")}`,
                };
            }
            const payment = await prisma_1.prisma.payment.findUnique({
                where: { id },
            });
            if (!payment) {
                return {
                    success: false,
                    message: "Payment not found",
                };
            }
            const updatedPayment = await prisma_1.prisma.payment.update({
                where: { id },
                data: { status: status }, // Cast to enum
            });
            // Log activity
            if (status === client_1.PaymentStatus.PAID) {
                await prisma_1.prisma.activity.create({
                    data: {
                        userId: payment.userId,
                        action: "PAYMENT_COMPLETED",
                        entity: "PAYMENT",
                        entityId: payment.id,
                        details: {
                            amount: payment.amount,
                            currency: payment.currency,
                        },
                    },
                });
                // Create notification
                await prisma_1.prisma.notification.create({
                    data: {
                        userId: payment.userId,
                        title: "Payment Received",
                        message: `Your payment of ${payment.amount} ${payment.currency} has been processed successfully.`,
                        type: "SUCCESS",
                        data: { paymentId: payment.id },
                    },
                });
            }
            return {
                success: true,
                message: "Payment status updated successfully",
                data: updatedPayment,
            };
        }
        catch (error) {
            // Fix error type
            logger_1.default.error("Update payment status error:", error);
            throw error;
        }
    }
    async getPaymentStats(userId) {
        try {
            const where = {};
            if (userId) {
                where.userId = userId;
            }
            const [totalPayments, totalAmount, successfulPayments, failedPayments, pendingPayments, recentPayments,] = await Promise.all([
                prisma_1.prisma.payment.count({ where }),
                prisma_1.prisma.payment.aggregate({
                    where: { ...where, status: client_1.PaymentStatus.PAID },
                    _sum: { amount: true },
                }),
                prisma_1.prisma.payment.count({
                    where: { ...where, status: client_1.PaymentStatus.PAID },
                }),
                prisma_1.prisma.payment.count({
                    where: { ...where, status: client_1.PaymentStatus.FAILED },
                }),
                prisma_1.prisma.payment.count({
                    where: { ...where, status: client_1.PaymentStatus.PENDING },
                }),
                prisma_1.prisma.payment.findMany({
                    where: { ...where, status: client_1.PaymentStatus.PAID },
                    orderBy: { createdAt: "desc" },
                    take: 5,
                }),
            ]);
            const stats = {
                totalPayments,
                totalAmount: totalAmount._sum.amount || 0,
                successfulPayments,
                failedPayments,
                pendingPayments,
                recentPayments,
            };
            return {
                success: true,
                message: "Payment stats retrieved successfully",
                data: stats,
            };
        }
        catch (error) {
            // Fix error type
            logger_1.default.error("Get payment stats error:", error);
            throw error;
        }
    }
    async refundPayment(id) {
        try {
            const payment = await prisma_1.prisma.payment.findUnique({
                where: { id, status: client_1.PaymentStatus.PAID },
            });
            if (!payment) {
                return {
                    success: false,
                    message: "Payment not found or not eligible for refund",
                };
            }
            if (!payment.stripePaymentId) {
                return {
                    success: false,
                    message: "Stripe payment ID not found",
                };
            }
            // Process refund through Stripe
            const refund = await stripe_1.stripe.refunds.create({
                payment_intent: payment.stripePaymentId,
            });
            // Update payment status
            const updatedPayment = await prisma_1.prisma.payment.update({
                where: { id },
                data: { status: client_1.PaymentStatus.REFUNDED }, // Use enum
            });
            // Log activity
            await prisma_1.prisma.activity.create({
                data: {
                    userId: payment.userId,
                    action: "PAYMENT_REFUNDED",
                    entity: "PAYMENT",
                    entityId: payment.id,
                    details: {
                        amount: payment.amount,
                        currency: payment.currency,
                        refundId: refund.id,
                    },
                },
            });
            // Create notification
            await prisma_1.prisma.notification.create({
                data: {
                    userId: payment.userId,
                    title: "Payment Refunded",
                    message: `Your payment of ${payment.amount} ${payment.currency} has been refunded.`,
                    type: "INFO",
                    data: { paymentId: payment.id, refundId: refund.id },
                },
            });
            return {
                success: true,
                message: "Payment refunded successfully",
                data: {
                    payment: updatedPayment,
                    refund,
                },
            };
        }
        catch (error) {
            // Fix error type
            logger_1.default.error("Refund payment error:", error);
            throw error;
        }
    }
}
exports.PaymentService = PaymentService;
//# sourceMappingURL=payment.service.js.map