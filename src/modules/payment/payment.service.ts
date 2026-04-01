import { stripe } from "../../config/stripe";
import logger from "../../shared/helpers/logger";
import { prisma } from "../../shared/helpers/prisma";
import { ApiResponse } from "../../shared/types";
import { CreatePaymentInput, PaymentQueryParams } from "./payment.interface";
import { PaymentStatus } from "@prisma/client";

export class PaymentService {
 async createPaymentIntent(
  userId: string,
  data: CreatePaymentInput,
): Promise<ApiResponse> {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(data.amount * 100),
      currency: data.currency || "usd",
      metadata: {
        userId,
        orderId: data.orderId || "",
        description: data.description || "",
      },
    });

    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: data.amount,
        currency: data.currency || "usd",
        status: PaymentStatus.PENDING,
        stripePaymentId: paymentIntent.id,
        description: data.description,
        orderId: data.orderId, 
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
  } catch (error: any) {
    logger.error("Create payment intent error:", error);
    throw error;
  }
}

  async getPayments(
    params: PaymentQueryParams,
    userId?: string,
  ): Promise<ApiResponse> {
    try {
      // Parse numeric values properly
      const page = Math.max(1, Number(params.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(params.limit) || 10));
      const skip = (page - 1) * limit;

      const {
        status,
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

      // Handle status filtering - only if status is a valid enum value
      if (status && status !== "all" && status !== "") {
        // Check if status is a valid PaymentStatus enum value
        const validStatuses = Object.values(PaymentStatus) as string[];
        if (validStatuses.includes(status)) {
          where.status = status as PaymentStatus;
        }
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }

      // Handle search
      if (search && search.trim() !== "") {
        where.OR = [
          { user: { name: { contains: search, mode: "insensitive" } } },
          { user: { email: { contains: search, mode: "insensitive" } } },
          { stripePaymentId: { contains: search, mode: "insensitive" } },
        ];
      }

      // Get payments
      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
        }),
        prisma.payment.count({ where }),
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
    } catch (error: any) {
      logger.error("Get payments error:", error);
      return {
        success: false,
        message: "Failed to get payments",
        error: error?.message || "Unknown error",
      };
    }
  }

  async getPaymentById(id: string, userId?: string): Promise<ApiResponse> {
    try {
      const where: any = { id };

      if (userId) {
        where.userId = userId;
      }

      const payment = await prisma.payment.findUnique({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
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
    } catch (error: any) {
      logger.error("Get payment by ID error:", error);
      return {
        success: false,
        message: "Failed to get payment",
        error: error?.message || "Unknown error",
      };
    }
  }

  async updatePaymentStatus(id: string, status: string): Promise<ApiResponse> {
    try {
      // Validate status is a valid PaymentStatus enum
      const validStatuses = Object.values(PaymentStatus) as string[];
      if (!validStatuses.includes(status)) {
        return {
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        };
      }

      const payment = await prisma.payment.findUnique({
        where: { id },
      });

      if (!payment) {
        return {
          success: false,
          message: "Payment not found",
        };
      }

      const updatedPayment = await prisma.payment.update({
        where: { id },
        data: { status: status as PaymentStatus },
      });

      // Log activity for successful payments
      if (status === PaymentStatus.PAID) {
        await prisma.activity.create({
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

        await prisma.notification.create({
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
    } catch (error: any) {
      logger.error("Update payment status error:", error);
      return {
        success: false,
        message: "Failed to update payment status",
        error: error?.message || "Unknown error",
      };
    }
  }

  async getPaymentStats(userId?: string): Promise<ApiResponse> {
    try {
      const where: any = {};
      if (userId) {
        where.userId = userId;
      }

      const [
        totalPayments,
        totalAmount,
        successfulPayments,
        failedPayments,
        pendingPayments,
        refundedPayments,
        recentPayments,
      ] = await Promise.all([
        prisma.payment.count({ where }),
        prisma.payment.aggregate({
          where: { ...where, status: PaymentStatus.PAID },
          _sum: { amount: true },
        }),
        prisma.payment.count({
          where: { ...where, status: PaymentStatus.PAID },
        }),
        prisma.payment.count({
          where: { ...where, status: PaymentStatus.FAILED },
        }),
        prisma.payment.count({
          where: { ...where, status: PaymentStatus.PENDING },
        }),
        prisma.payment.count({
          where: { ...where, status: PaymentStatus.REFUNDED },
        }),
        prisma.payment.findMany({
          where: { ...where, status: PaymentStatus.PAID },
          orderBy: { createdAt: "desc" },
          take: 5,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        }),
      ]);

      const stats = {
        totalPayments,
        totalRevenue: totalAmount._sum.amount || 0,
        successfulPayments,
        failedPayments,
        pendingPayments,
        refundedPayments,
        successRate: totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0,
        recentPayments,
      };

      return {
        success: true,
        message: "Payment stats retrieved successfully",
        data: stats,
      };
    } catch (error: any) {
      logger.error("Get payment stats error:", error);
      return {
        success: false,
        message: "Failed to get payment stats",
        error: error?.message || "Unknown error",
      };
    }
  }

  async refundPayment(id: string): Promise<ApiResponse> {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id, status: PaymentStatus.PAID },
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
      const refund = await stripe.refunds.create({
        payment_intent: payment.stripePaymentId,
      });

      // Update payment status
      const updatedPayment = await prisma.payment.update({
        where: { id },
        data: { status: PaymentStatus.REFUNDED },
      });

      // Log activity
      await prisma.activity.create({
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
      await prisma.notification.create({
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
    } catch (error: any) {
      logger.error("Refund payment error:", error);
      return {
        success: false,
        message: "Failed to refund payment",
        error: error?.message || "Unknown error",
      };
    }
  }
}