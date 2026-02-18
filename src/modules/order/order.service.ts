// order.service.ts
import { config } from "../../config";
import { stripe } from "../../config/stripe";
import logger from "../../shared/helpers/logger";
import { prisma } from "../../shared/helpers/prisma";
import { 
  ApiResponse, 
  CreateOrderInput, 
  OrderQueryParams, 
  UpdateOrderStatusInput 
} from "../../shared/types";

export class OrderService {
  async createOrder(
    userId: string,
    data: CreateOrderInput,
  ): Promise<ApiResponse> {
    try {
      // Validate products and calculate totals
      let subtotal = 0;
      const orderItems: Array<{
        productId: string;
        quantity: number;
        price: number;
      }> = [];

      for (const item of data.items) {
        const product = await prisma.product.findUnique({
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
      const order = await prisma.$transaction(async (tx: any) => {
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
    } catch (error) {
      logger.error("Create order error:", error);
      throw error;
    }
  }

  async getOrders(
    params: OrderQueryParams,
    userId?: string,
  ): Promise<ApiResponse> {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        paymentStatus,
        startDate,
        endDate,
        search,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = params;

      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};

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
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
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
        prisma.order.findMany({
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
        prisma.order.count({ where }),
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
    } catch (error) {
      logger.error("Get orders error:", error);
      throw error;
    }
  }

  async getOrderById(id: string, userId?: string): Promise<ApiResponse> {
    try {
      const where: any = { id };

      if (userId) {
        where.userId = userId;
      }

      const order = await prisma.order.findUnique({
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
    } catch (error) {
      logger.error("Get order by ID error:", error);
      throw error;
    }
  }

  async getOrderByNumber(
    orderNumber: string,
    userId?: string,
  ): Promise<ApiResponse> {
    try {
      const where: any = { orderNumber };

      if (userId) {
        where.userId = userId;
      }

      const order = await prisma.order.findUnique({
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
    } catch (error) {
      logger.error("Get order by number error:", error);
      throw error;
    }
  }

  async updateOrderStatus(
    id: string,
    data: UpdateOrderStatusInput,
  ): Promise<ApiResponse> {
    try {
      const order = await prisma.order.findUnique({
        where: { id },
      });

      if (!order) {
        return {
          success: false,
          message: "Order not found",
        };
      }

      const updatedOrder = await prisma.$transaction(async (tx: any) => {
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
    } catch (error) {
      logger.error("Update order status error:", error);
      throw error;
    }
  }

  async cancelOrder(id: string, userId: string): Promise<ApiResponse> {
    try {
      const order = await prisma.order.findUnique({
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

      const updatedOrder = await prisma.$transaction(async (tx: any) => {
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
            paymentStatus:
              order.paymentStatus === "PAID" ? "REFUNDED" : "FAILED",
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
    } catch (error) {
      logger.error("Cancel order error:", error);
      throw error;
    }
  }

  async createCheckoutSession(orderId: string): Promise<ApiResponse> {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: {
            include: {
              subscription: true,
            },
          },
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
        const customer = await stripe.customers.create({
          email: order.user.email,
          name: order.user.name,
          metadata: {
            userId: order.user.id,
          },
        });

        customerId = customer.id;

        // Update user with Stripe customer ID
        await prisma.user.update({
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

      // Helper function to convert Prisma Json to string array
      const getProductImages = (images: any): string[] => {
        if (!images) return [];
        
        if (Array.isArray(images)) {
          // Filter out non-string values and ensure they're strings
          return images.filter(img => typeof img === 'string').map(img => img as string);
        }
        
        // If it's a string, try to parse it as JSON
        if (typeof images === 'string') {
          try {
            const parsed = JSON.parse(images);
            if (Array.isArray(parsed)) {
              return parsed.filter(img => typeof img === 'string');
            }
          } catch {
            // If it's not valid JSON but is a string, return it as an array
            return [images];
          }
        }
        
        return [];
      };

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        line_items: order.orderItems.map((item) => ({
          price_data: {
            currency: "usd",
            product_data: {
              name: item.product.name,
              images: getProductImages(item.product.images).slice(0, 1),
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        })),
        mode: "payment",
        success_url: `${config.FRONTEND_URL}/orders/${order.id}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${config.FRONTEND_URL}/orders/${order.id}/cancel`,
        metadata: {
          orderId: order.id,
          userId: order.user.id,
        },
      });

      // Update order with Stripe session ID using the correct unique identifier
      await prisma.order.update({
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
    } catch (error) {
      logger.error("Create checkout session error:", error);
      throw error;
    }
  }

  async handleStripeWebhook(
    payload: any,
    signature: string,
  ): Promise<ApiResponse> {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        config.STRIPE.WEBHOOK_SECRET,
      );

      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as any;
          
          if (!session.id) {
            throw new Error("Session ID is missing");
          }

          await prisma.$transaction(async (tx: any) => {
            // First find the order by stripeSessionId
            const order = await tx.order.findUnique({
              where: { stripeSessionId: session.id },
            });

            if (!order) {
              throw new Error(`Order not found for session: ${session.id}`);
            }

            // Update order payment status
            await tx.order.update({
              where: { id: order.id },
              data: {
                paymentStatus: "PAID",
                stripePaymentId: session.payment_intent,
              },
            });

            // Create payment record
            await tx.payment.create({
              data: {
                userId: session.metadata?.userId || order.userId,
                amount: session.amount_total / 100,
                currency: session.currency,
                status: "PAID",
                stripePaymentId: session.payment_intent,
                description: `Payment for order #${order.orderNumber}`,
              },
            });

            // Create notification
            await tx.notification.create({
              data: {
                userId: session.metadata?.userId || order.userId,
                title: "Payment Successful",
                message: `Payment for order #${order.orderNumber} was successful.`,
                type: "SUCCESS",
                data: { orderId: order.id },
              },
            });
          });
          break;
        }

        case "checkout.session.expired": {
          const session = event.data.object as any;

          if (!session.id) {
            throw new Error("Session ID is missing");
          }

          // First find the order by stripeSessionId
          const order = await prisma.order.findFirst({
            where: { stripeSessionId: session.id },
          });

          if (order) {
            await prisma.order.update({
              where: { id: order.id },
              data: {
                paymentStatus: "FAILED",
              },
            });
          }
          break;
        }
      }

      return {
        success: true,
        message: "Webhook processed successfully",
      };
    } catch (error) {
      logger.error("Stripe webhook error:", error);
      throw error;
    }
  }

  async getOrderStats(userId?: string): Promise<ApiResponse> {
    try {
      const where: any = {};
      if (userId) {
        where.userId = userId;
      }

      const [
        totalOrders,
        pendingOrders,
        processingOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue,
        averageOrderValue,
      ] = await Promise.all([
        prisma.order.count({ where }),
        prisma.order.count({ where: { ...where, status: "PENDING" } }),
        prisma.order.count({ where: { ...where, status: "PROCESSING" } }),
        prisma.order.count({ where: { ...where, status: "DELIVERED" } }),
        prisma.order.count({ where: { ...where, status: "CANCELLED" } }),
        prisma.order.aggregate({
          where: { ...where, paymentStatus: "PAID" },
          _sum: { total: true },
        }),
        prisma.order.aggregate({
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
    } catch (error) {
      logger.error("Get order stats error:", error);
      throw error;
    }
  }

  async getUserOrders(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<ApiResponse> {
    try {
      const skip = (page - 1) * limit;

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
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
        prisma.order.count({ where: { userId } }),
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
    } catch (error) {
      logger.error("Get user orders error:", error);
      throw error;
    }
  }
}