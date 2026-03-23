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
  private convertAddressToJson(address: any): any {
    if (!address) return null;
    
    return {
      street: address.street,
      city: address.city,
      state: address.state,
      country: address.country,
      zipCode: address.zipCode || address.postalCode,
      phone: address.phone,
      ...(address.firstName && { firstName: address.firstName }),
      ...(address.lastName && { lastName: address.lastName }),
      ...(address.company && { company: address.company }),
      ...(address.apartment && { apartment: address.apartment }),
    };
  }

  async createOrder(
    userId: string,
    data: CreateOrderInput,
  ): Promise<ApiResponse> {
    try {
      // Validate products and calculate totals
      let subtotal = 0;
      const orderItemsData: Array<{
        productId: string;
        quantity: number;
        price: number;
      }> = [];

      // Fetch product details
      const productDetails = await Promise.all(
        data.items.map(item => 
          prisma.product.findUnique({
            where: { id: item.productId, isActive: true },
            select: {
              id: true,
              name: true,
              sku: true,
              stock: true,
              price: true,
            },
          })
        )
      );

      for (let i = 0; i < data.items.length; i++) {
        const item = data.items[i];
        const product = productDetails[i];

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
        orderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        });
      }

      const tax = data.tax || 0;
      const shipping = data.shipping || 0;
      const discount = data.discount || 0;
      const total = subtotal + tax + shipping - discount;

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Convert addresses to JSON format
      const shippingAddressJson = this.convertAddressToJson(data.shippingAddress);
      const billingAddressJson = this.convertAddressToJson(
        data.billingAddress || data.shippingAddress
      );

      // Create order
      const order = await prisma.$transaction(async (tx) => {
        // Update product stock
        for (let i = 0; i < data.items.length; i++) {
          const item = data.items[i];
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }

        // Create order items with product details
        const orderItemsToCreate = orderItemsData.map((item, index) => {
          const product = productDetails[index];
          const itemTotal = item.price * item.quantity;
          return {
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            total: itemTotal,
            tax: 0,
            name: product?.name || "",
            sku: product?.sku || "",
          };
        });

        // Create order - FIXED: Use subtotal instead of amount
        const newOrder = await tx.order.create({
          data: {
            orderNumber,
            userId,
            subtotal: subtotal,  // Changed from amount to subtotal
            tax: tax,
            shipping: shipping,
            discount: discount,
            total: total,
            shippingAddress: shippingAddressJson,
            billingAddress: billingAddressJson,
            paymentMethod: data.paymentMethod || "PENDING",
            status: "PENDING",
            paymentStatus: "PENDING",
            orderItems: {
              create: orderItemsToCreate,
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
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        // Log activity (try-catch to prevent order failure if logging fails)
        try {
          await tx.activity.create({
            data: {
              userId,
              action: "CREATE_ORDER",
              entity: "ORDER",
              entityId: newOrder.id,
              details: {
                orderNumber: newOrder.orderNumber,
                total: newOrder.total,
                itemsCount: orderItemsData.length,
              },
            },
          });
        } catch (activityError) {
          logger.warn("Failed to create activity log:", activityError);
        }

        // Create notification (try-catch to prevent order failure if notification fails)
        try {
          await tx.notification.create({
            data: {
              userId,
              title: "Order Placed",
              message: `Your order #${orderNumber} has been placed successfully.`,
              type: "SUCCESS",
              data: { orderId: newOrder.id },
            },
          });
        } catch (notificationError) {
          logger.warn("Failed to create notification:", notificationError);
        }

        return newOrder;
      });

      return {
        success: true,
        message: "Order created successfully",
        data: order,
      };
    } catch (error: any) {
      logger.error("Create order error:", error);
      return {
        success: false,
        message: "Failed to create order",
        error: error?.message || "Unknown error",
      };
    }
  }

  async getOrders(
    params: OrderQueryParams,
    userId?: string,
  ): Promise<ApiResponse> {
    try {
      // Parse numeric values properly
      const page = Math.max(1, Number(params.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(params.limit) || 10));
      const skip = (page - 1) * limit;

      const {
        status,
        paymentStatus,
        startDate,
        endDate,
        search,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = params;

      // Build where clause
      const where: any = {};

      if (userId) {
        where.userId = userId;
      }

      if (status && status !== "all" && status !== "") {
        where.status = status;
      }

      if (paymentStatus && paymentStatus !== "all" && paymentStatus !== "") {
        where.paymentStatus = paymentStatus;
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }

      if (search && search.trim() !== "") {
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
    } catch (error: any) {
      logger.error("Get orders error:", error);
      return {
        success: false,
        message: "Failed to get orders",
        error: error?.message || "Unknown error",
      };
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
    } catch (error: any) {
      logger.error("Get order by ID error:", error);
      return {
        success: false,
        message: "Failed to get order",
        error: error?.message || "Unknown error",
      };
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
    } catch (error: any) {
      logger.error("Get order by number error:", error);
      return {
        success: false,
        message: "Failed to get order",
        error: error?.message || "Unknown error",
      };
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

      const updatedOrder = await prisma.$transaction(async (tx) => {
        const updated = await tx.order.update({
          where: { id },
          data: {
            status: data.status,
            paymentStatus: data.paymentStatus || order.paymentStatus,
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
        try {
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
        } catch (activityError) {
          logger.warn("Failed to create activity log:", activityError);
        }

        return updated;
      });

      return {
        success: true,
        message: "Order status updated successfully",
        data: updatedOrder,
      };
    } catch (error: any) {
      logger.error("Update order status error:", error);
      return {
        success: false,
        message: "Failed to update order status",
        error: error?.message || "Unknown error",
      };
    }
  }

  async cancelOrder(id: string, userId: string): Promise<ApiResponse> {
    try {
      const order = await prisma.order.findUnique({
        where: { id, userId },
        include: {
          orderItems: true,
        },
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

      const updatedOrder = await prisma.$transaction(async (tx) => {
        // Restore product stock
        for (const item of order.orderItems) {
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

        return updated;
      });

      return {
        success: true,
        message: "Order cancelled successfully",
        data: updatedOrder,
      };
    } catch (error: any) {
      logger.error("Cancel order error:", error);
      return {
        success: false,
        message: "Failed to cancel order",
        error: error?.message || "Unknown error",
      };
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
      ]);

      const averageOrderValue = totalOrders > 0 ? (totalRevenue._sum.total || 0) / totalOrders : 0;

      const stats = {
        totalOrders,
        pendingOrders,
        processingOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        averageOrderValue,
      };

      return {
        success: true,
        message: "Order stats retrieved successfully",
        data: stats,
      };
    } catch (error: any) {
      logger.error("Get order stats error:", error);
      return {
        success: false,
        message: "Failed to get order stats",
        error: error?.message || "Unknown error",
      };
    }
  }

  async getUserOrders(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<ApiResponse> {
    try {
      const safePage = Math.max(1, Number(page) || 1);
      const safeLimit = Math.min(100, Math.max(1, Number(limit) || 10));
      const skip = (safePage - 1) * safeLimit;

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
          take: safeLimit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.order.count({ where: { userId } }),
      ]);

      const totalPages = Math.ceil(total / safeLimit);

      return {
        success: true,
        message: "User orders retrieved successfully",
        data: orders,
        meta: {
          page: safePage,
          limit: safeLimit,
          total,
          totalPages,
        },
      };
    } catch (error: any) {
      logger.error("Get user orders error:", error);
      return {
        success: false,
        message: "Failed to get user orders",
        error: error?.message || "Unknown error",
      };
    }
  }

  async createCheckoutSession(orderId: string): Promise<ApiResponse> {
    try {
      const order = await prisma.order.findUnique({
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

      // Simplified checkout session
      return {
        success: true,
        message: "Checkout session created",
        data: {
          sessionId: `session_${orderId}`,
          url: `/checkout/${orderId}`,
        },
      };
    } catch (error: any) {
      logger.error("Create checkout session error:", error);
      return {
        success: false,
        message: "Failed to create checkout session",
        error: error?.message || "Unknown error",
      };
    }
  }

  async handleStripeWebhook(
    payload: any,
    signature: string,
  ): Promise<ApiResponse> {
    try {
      // Simplified webhook handler
      return {
        success: true,
        message: "Webhook processed successfully",
      };
    } catch (error: any) {
      logger.error("Stripe webhook error:", error);
      return {
        success: false,
        message: "Failed to process webhook",
        error: error?.message || "Unknown error",
      };
    }
  }
}