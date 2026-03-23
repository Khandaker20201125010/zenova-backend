// order.controller.ts
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { OrderService } from "./order.service";
import { AuthRequest, OrderQueryParams } from "../../shared/types";
import { errorResponse } from "../../shared/helpers/apiResponse";

const orderService = new OrderService();

export class OrderController {
  async createOrder(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json(errorResponse("Authentication required"));
      }

      const result = await orderService.createOrder(req.user.id, req.body);

      if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST).json(result);
      }

      return res.status(StatusCodes.CREATED).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to create order", error.message));
    }
  }

async getOrders(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json(errorResponse("Authentication required"));
    }

    // Check if user is admin - if yes, return all orders
    const userId = req.user.role === "ADMIN" ? undefined : req.user.id;

    // Parse query parameters to numbers where needed
    const queryParams: OrderQueryParams = {
      ...req.query,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
    };

    const result = await orderService.getOrders(queryParams, userId);
    return res.status(StatusCodes.OK).json(result);
  } catch (error: any) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse("Failed to get orders", error.message));
  }
}

  async getOrderById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json(errorResponse("Authentication required"));
      }

      // Fix: Handle string or string[] for id
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      // Check if user is admin or owns the order
      const userId = req.user.role === "ADMIN" ? undefined : req.user.id;

      const result = await orderService.getOrderById(id, userId);

      if (!result.success) {
        return res.status(StatusCodes.NOT_FOUND).json(result);
      }

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to get order", error.message));
    }
  }

  async getOrderByNumber(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json(errorResponse("Authentication required"));
      }

      // Fix: Handle string or string[] for orderNumber
      const orderNumber = Array.isArray(req.params.orderNumber)
        ? req.params.orderNumber[0]
        : req.params.orderNumber;

      // Check if user is admin or owns the order
      const userId = req.user.role === "ADMIN" ? undefined : req.user.id;

      const result = await orderService.getOrderByNumber(orderNumber, userId);

      if (!result.success) {
        return res.status(StatusCodes.NOT_FOUND).json(result);
      }

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to get order", error.message));
    }
  }

  async updateOrderStatus(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json(errorResponse("Insufficient permissions"));
      }

      // Fix: Handle string or string[] for id
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const result = await orderService.updateOrderStatus(id, req.body);

      if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST).json(result);
      }

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to update order status", error.message));
    }
  }

  async cancelOrder(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json(errorResponse("Authentication required"));
      }

      // Fix: Handle string or string[] for id
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const result = await orderService.cancelOrder(id, req.user.id);

      if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST).json(result);
      }

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to cancel order", error.message));
    }
  }

  async createCheckoutSession(
    req: AuthRequest,
    res: Response,
  ): Promise<Response> {
    try {
      if (!req.user) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json(errorResponse("Authentication required"));
      }

      // Fix: Handle string or string[] for id
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const result = await orderService.createCheckoutSession(id);

      if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST).json(result);
      }

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(
          errorResponse("Failed to create checkout session", error.message),
        );
    }
  }

  async handleStripeWebhook(req: Request, res: Response): Promise<Response> {
    try {
      const signature = req.headers["stripe-signature"] as string;

      if (!signature) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json(errorResponse("Stripe signature required"));
      }

      const result = await orderService.handleStripeWebhook(
        req.body,
        signature,
      );
      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Webhook processing failed", error.message));
    }
  }

  async getOrderStats(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json(errorResponse("Authentication required"));
      }

      // Check if user is admin - if yes, return all stats
      const userId = req.user.role === "ADMIN" ? undefined : req.user.id;

      const result = await orderService.getOrderStats(userId);
      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to get order stats", error.message));
    }
  }

  async getUserOrders(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json(errorResponse("Authentication required"));
      }

      const { page = 1, limit = 10 } = req.query;
      const result = await orderService.getUserOrders(
        req.user.id,
        parseInt(page as string),
        parseInt(limit as string),
      );

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to get user orders", error.message));
    }
  }
}