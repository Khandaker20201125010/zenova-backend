"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const config_1 = require("../../config");
const stripe_1 = require("../../config/stripe");
const logger_1 = __importDefault(require("../../shared/helpers/logger"));
const prisma_1 = require("../../shared/helpers/prisma");
class OrderService {
    async createOrder(userId, data) {
        try {
            // Validate products and calculate totals
            let subtotal = 0;
            const orderItems = [];
            for (const item of data.items) {
                const product = await prisma_1.prisma.product.findUnique({
                    where: { id: item.productId, isActive: true },
                });
                if (!product) {
                    return {
                        success: false,
                        message: `Product not found: ${item.productId}`,
                    };
                }
                if (product.stock < item.quantity) {
                    return {
                        success: false,
                        message: `Insufficient stock for product: ${product.name}`,
                    };
                }
                subtotal += item.price * item.quantity;
                orderItems.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price,
                });
            }
            const tax = data.tax || 0;
            const shipping = data.shipping || 0;
            const total = subtotal + tax + shipping;
            // Generate order number
            const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
            // Create order
            const order = await prisma_1.prisma.$transaction(async (tx) => {
                // Update product stock
                for (const item of data.items) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: {
                            stock: {
                                decrement: item.quantity,
                            },
                        },
                    });
                }
                // Create order
                const newOrder = await tx.order.create({
                    data: {
                        orderNumber,
                        userId,
                        amount: subtotal,
                        tax,
                        shipping,
                        total,
                        shippingAddress: data.shippingAddress,
                        billingAddress: data.billingAddress || data.shippingAddress,
                        orderItems: {
                            create: orderItems,
                        },
                    },
                    include: {
                        orderItems: {
                            include: {
                                product: {
                                    select: {
                                        id: true,
                                        name: true,
                                        images: true,
                                    },
                                },
                            },
                        },
                    },
                });
                // Log activity
                await tx.activity.create({
                    data: {
                        userId,
                        action: "CREATE_ORDER",
                        entity: "ORDER",
                        entityId: newOrder.id,
                        details: {
                            orderNumber: newOrder.orderNumber,
                            total: newOrder.total,
                            itemsCount: orderItems.length,
                        },
                    },
                });
                // Create notification
                await tx.notification.create({
                    data: {
                        userId,
                        title: "Order Placed",
                        message: `Your order #${orderNumber} has been placed successfully.`,
                        type: "SUCCESS",
                        data: { orderId: newOrder.id },
                    },
                });
                return newOrder;
            });
            return {
                success: true,
                message: "Order created successfully",
                data: order,
            };
        }
        catch (error) {
            logger_1.default.error("Create order error:", error);
            throw error;
        }
    }
    async getOrders(params, userId) {
        try {
            const { page = 1, limit = 10, status, paymentStatus, startDate, endDate, search, sortBy = "createdAt", sortOrder = "desc", } = params;
            const skip = (page - 1) * limit;
            // Build where clause
            const where = {};
            if (userId) {
                where.userId = userId;
            }
            if (status) {
                where.status = status;
            }
            if (paymentStatus) {
                where.paymentStatus = paymentStatus;
            }
            if (startDate || endDate) {
                where.createdAt = {};
                if (startDate)
                    where.createdAt.gte = new Date(startDate);
                if (endDate)
                    where.createdAt.lte = new Date(endDate);
            }
            if (search) {
                where.OR = [
                    { orderNumber: { contains: search, mode: "insensitive" } },
                    { user: { name: { contains: search, mode: "insensitive" } } },
                    { user: { email: { contains: search, mode: "insensitive" } } },
                ];
            }
            // Get orders
            const [orders, total] = await Promise.all([
                prisma_1.prisma.order.findMany({
                    where,
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                        orderItems: {
                            include: {
                                product: {
                                    select: {
                                        id: true,
                                        name: true,
                                        images: true,
                                    },
                                },
                            },
                        },
                        _count: {
                            select: {
                                orderItems: true,
                            },
                        },
                    },
                    skip,
                    take: limit,
                    orderBy: { [sortBy]: sortOrder },
                }),
                prisma_1.prisma.order.count({ where }),
            ]);
            const totalPages = Math.ceil(total / limit);
            return {
                success: true,
                message: "Orders retrieved successfully",
                data: orders,
                meta: {
                    page,
                    limit,
                    total,
                    totalPages,
                },
            };
        }
        catch (error) {
            logger_1.default.error("Get orders error:", error);
            throw error;
        }
    }
    async getOrderById(id, userId) {
        try {
            const where = { id };
            if (userId) {
                where.userId = userId;
            }
            const order = await prisma_1.prisma.order.findUnique({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                        },
                    },
                    orderItems: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    slug: true,
                                    images: true,
                                    price: true,
                                },
                            },
                        },
                    },
                },
            });
            if (!order) {
                return {
                    success: false,
                    message: "Order not found",
                };
            }
            return {
                success: true,
                message: "Order retrieved successfully",
                data: order,
            };
        }
        catch (error) {
            logger_1.default.error("Get order by ID error:", error);
            throw error;
        }
    }
    async getOrderByNumber(orderNumber, userId) {
        try {
            const where = { orderNumber };
            if (userId) {
                where.userId = userId;
            }
            const order = await prisma_1.prisma.order.findUnique({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                        },
                    },
                    orderItems: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    slug: true,
                                    images: true,
                                    price: true,
                                },
                            },
                        },
                    },
                },
            });
            if (!order) {
                return {
                    success: false,
                    message: "Order not found",
                };
            }
            return {
                success: true,
                message: "Order retrieved successfully",
                data: order,
            };
        }
        catch (error) {
            logger_1.default.error("Get order by number error:", error);
            throw error;
        }
    }
    async updateOrderStatus(id, data) {
        try {
            const order = await prisma_1.prisma.order.findUnique({
                where: { id },
            });
            if (!order) {
                return {
                    success: false,
                    message: "Order not found",
                };
            }
            const updatedOrder = await prisma_1.prisma.$transaction(async (tx) => {
                const updated = await tx.order.update({
                    where: { id },
                    data: {
                        status: data.status,
                        paymentStatus: data.paymentStatus,
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                name: true,
                            },
                        },
                    },
                });
                // Log activity
                await tx.activity.create({
                    data: {
                        userId: order.userId,
                        action: "UPDATE_ORDER_STATUS",
                        entity: "ORDER",
                        entityId: order.id,
                        details: {
                            oldStatus: order.status,
                            newStatus: data.status,
                            orderNumber: order.orderNumber,
                        },
                    },
                });
                // Create notification
                await tx.notification.create({
                    data: {
                        userId: order.userId,
                        title: "Order Status Updated",
                        message: `Your order #${order.orderNumber} status has been updated to ${data.status}.`,
                        type: "INFO",
                        data: { orderId: order.id, status: data.status },
                    },
                });
                return updated;
            });
            return {
                success: true,
                message: "Order status updated successfully",
                data: updatedOrder,
            };
        }
        catch (error) {
            logger_1.default.error("Update order status error:", error);
            throw error;
        }
    }
    async cancelOrder(id, userId) {
        try {
            const order = await prisma_1.prisma.order.findUnique({
                where: { id, userId },
            });
            if (!order) {
                return {
                    success: false,
                    message: "Order not found",
                };
            }
            if (!["PENDING", "PROCESSING"].includes(order.status)) {
                return {
                    success: false,
                    message: "Order cannot be cancelled at this stage",
                };
            }
            const updatedOrder = await prisma_1.prisma.$transaction(async (tx) => {
                // Restore product stock
                const orderItems = await tx.orderItem.findMany({
                    where: { orderId: id },
                    include: { product: true },
                });
                for (const item of orderItems) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: {
                            stock: {
                                increment: item.quantity,
                            },
                        },
                    });
                }
                // Update order status
                const updated = await tx.order.update({
                    where: { id },
                    data: {
                        status: "CANCELLED",
                        paymentStatus: order.paymentStatus === "PAID" ? "REFUNDED" : "FAILED",
                    },
                });
                // Log activity
                await tx.activity.create({
                    data: {
                        userId,
                        action: "CANCEL_ORDER",
                        entity: "ORDER",
                        entityId: id,
                        details: {
                            orderNumber: order.orderNumber,
                        },
                    },
                });
                // Create notification
                await tx.notification.create({
                    data: {
                        userId,
                        title: "Order Cancelled",
                        message: `Your order #${order.orderNumber} has been cancelled.`,
                        type: "INFO",
                        data: { orderId: id },
                    },
                });
                return updated;
            });
            return {
                success: true,
                message: "Order cancelled successfully",
                data: updatedOrder,
            };
        }
        catch (error) {
            logger_1.default.error("Cancel order error:", error);
            throw error;
        }
    }
    async createCheckoutSession(orderId) {
        try {
            const order = await prisma_1.prisma.order.findUnique({
                where: { id: orderId },
                include: {
                    user: true,
                    orderItems: {
                        include: {
                            product: true,
                        },
                    },
                },
            });
            if (!order) {
                return {
                    success: false,
                    message: "Order not found",
                };
            }
            if (order.paymentStatus === "PAID") {
                return {
                    success: false,
                    message: "Order already paid",
                };
            }
            // Get or create Stripe customer
            let customerId = order.user.subscription?.stripeCustomerId;
            if (!customerId) {
                const customer = await stripe_1.stripe.customers.create({
                    email: order.user.email,
                    name: order.user.name,
                    metadata: {
                        userId: order.user.id,
                    },
                });
                customerId = customer.id;
                // Update user with Stripe customer ID
                await prisma_1.prisma.user.update({
                    where: { id: order.user.id },
                    data: {
                        subscription: {
                            upsert: {
                                create: {
                                    stripeCustomerId: customerId,
                                    plan: "FREE",
                                    status: "ACTIVE",
                                },
                                update: {
                                    stripeCustomerId: customerId,
                                },
                            },
                        },
                    },
                });
            }
            // Create checkout session
            const session = await stripe_1.stripe.checkout.sessions.create({
                customer: customerId,
                payment_method_types: ["card"],
                line_items: order.orderItems.map((item) => ({
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: item.product.name,
                            images: item.product.images
                                ? item.product.images.slice(0, 1)
                                : [],
                        },
                        unit_amount: Math.round(item.price * 100),
                    },
                    quantity: item.quantity,
                })),
                mode: "payment",
                success_url: `${config_1.config.FRONTEND_URL}/orders/${order.id}/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${config_1.config.FRONTEND_URL}/orders/${order.id}/cancel`,
                metadata: {
                    orderId: order.id,
                    userId: order.user.id,
                },
            });
            // Update order with Stripe session ID
            await prisma_1.prisma.order.update({
                where: { id: orderId },
                data: { stripeSessionId: session.id },
            });
            return {
                success: true,
                message: "Checkout session created",
                data: {
                    sessionId: session.id,
                    url: session.url,
                },
            };
        }
        catch (error) {
            logger_1.default.error("Create checkout session error:", error);
            throw error;
        }
    }
    async handleStripeWebhook(payload, signature) {
        try {
            const event = stripe_1.stripe.webhooks.constructEvent(payload, signature, config_1.config.STRIPE.WEBHOOK_SECRET);
            switch (event.type) {
                case "checkout.session.completed": {
                    const session = event.data.object;
                    await prisma_1.prisma.$transaction(async (tx) => {
                        // Update order payment status
                        await tx.order.update({
                            where: { stripeSessionId: session.id },
                            data: {
                                paymentStatus: "PAID",
                                stripePaymentId: session.payment_intent,
                            },
                        });
                        // Create payment record
                        await tx.payment.create({
                            data: {
                                userId: session.metadata.userId,
                                amount: session.amount_total / 100,
                                currency: session.currency,
                                status: "PAID",
                                stripePaymentId: session.payment_intent,
                                description: `Payment for order #${session.metadata.orderId}`,
                            },
                        });
                        // Create notification
                        await tx.notification.create({
                            data: {
                                userId: session.metadata.userId,
                                title: "Payment Successful",
                                message: `Payment for order #${session.metadata.orderId} was successful.`,
                                type: "SUCCESS",
                                data: { orderId: session.metadata.orderId },
                            },
                        });
                    });
                    break;
                }
                case "checkout.session.expired": {
                    const session = event.data.object;
                    await prisma_1.prisma.order.update({
                        where: { stripeSessionId: session.id },
                        data: {
                            paymentStatus: "FAILED",
                        },
                    });
                    break;
                }
            }
            return {
                success: true,
                message: "Webhook processed successfully",
            };
        }
        catch (error) {
            logger_1.default.error("Stripe webhook error:", error);
            throw error;
        }
    }
    async getOrderStats(userId) {
        try {
            const where = {};
            if (userId) {
                where.userId = userId;
            }
            const [totalOrders, pendingOrders, processingOrders, deliveredOrders, cancelledOrders, totalRevenue, averageOrderValue,] = await Promise.all([
                prisma_1.prisma.order.count({ where }),
                prisma_1.prisma.order.count({ where: { ...where, status: "PENDING" } }),
                prisma_1.prisma.order.count({ where: { ...where, status: "PROCESSING" } }),
                prisma_1.prisma.order.count({ where: { ...where, status: "DELIVERED" } }),
                prisma_1.prisma.order.count({ where: { ...where, status: "CANCELLED" } }),
                prisma_1.prisma.order.aggregate({
                    where: { ...where, paymentStatus: "PAID" },
                    _sum: { total: true },
                }),
                prisma_1.prisma.order.aggregate({
                    where: { ...where, paymentStatus: "PAID" },
                    _avg: { total: true },
                }),
            ]);
            const stats = {
                totalOrders,
                pendingOrders,
                processingOrders,
                deliveredOrders,
                cancelledOrders,
                totalRevenue: totalRevenue._sum.total || 0,
                averageOrderValue: averageOrderValue._avg.total || 0,
            };
            return {
                success: true,
                message: "Order stats retrieved successfully",
                data: stats,
            };
        }
        catch (error) {
            logger_1.default.error("Get order stats error:", error);
            throw error;
        }
    }
    async getUserOrders(userId, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const [orders, total] = await Promise.all([
                prisma_1.prisma.order.findMany({
                    where: { userId },
                    include: {
                        orderItems: {
                            include: {
                                product: {
                                    select: {
                                        id: true,
                                        name: true,
                                        images: true,
                                    },
                                },
                            },
                        },
                        _count: {
                            select: {
                                orderItems: true,
                            },
                        },
                    },
                    skip,
                    take: limit,
                    orderBy: { createdAt: "desc" },
                }),
                prisma_1.prisma.order.count({ where: { userId } }),
            ]);
            const totalPages = Math.ceil(total / limit);
            return {
                success: true,
                message: "User orders retrieved successfully",
                data: orders,
                meta: {
                    page,
                    limit,
                    total,
                    totalPages,
                },
            };
        }
        catch (error) {
            logger_1.default.error("Get user orders error:", error);
            throw error;
        }
    }
}
exports.OrderService = OrderService;
//# sourceMappingURL=order.service.js.map