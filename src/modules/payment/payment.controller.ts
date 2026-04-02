import {  Response } from "express";
import { StatusCodes } from "http-status-codes";
import { PaymentService } from "./payment.service";
import { AuthRequest } from "../../shared/types";
import { errorResponse } from "../../shared/helpers/apiResponse";


const paymentService = new PaymentService();

export class PaymentController {
  async createPaymentIntent(
    req: AuthRequest,
    res: Response,
  ): Promise<Response> {
    try {
      if (!req.user) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json(errorResponse("Authentication required"));
      }

      const result = await paymentService.createPaymentIntent(
        req.user.id,
        req.body,
      );
      return res.status(StatusCodes.CREATED).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to create payment intent", error.message));
    }
  }

   async confirmPaymentIntent(
    req: AuthRequest,
    res: Response,
  ): Promise<Response> {
    try {
      if (!req.user) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json(errorResponse("Authentication required"));
      }

      const { paymentIntentId } = req.body;
      
      if (!paymentIntentId) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json(errorResponse("paymentIntentId is required"));
      }

      const result = await paymentService.confirmPaymentIntent(
        req.user.id,
        paymentIntentId,
      );

      if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST).json(result);
      }

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to confirm payment", error.message));
    }
  }

  async getPayments(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json(errorResponse("Authentication required"));
      }

      // Check if user is admin - if yes, return all payments
      const userId = req.user.role === "ADMIN" ? undefined : req.user.id;

      // Parse query parameters to numbers where needed
      const queryParams: any = {
        ...req.query,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await paymentService.getPayments(queryParams, userId);
      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to get payments", error.message));
    }
  }

  async getPaymentById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json(errorResponse("Authentication required"));
      }

      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      const userId = req.user.role === "ADMIN" ? undefined : req.user.id;

      const result = await paymentService.getPaymentById(id, userId);

      if (!result.success) {
        return res.status(StatusCodes.NOT_FOUND).json(result);
      }

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to get payment", error.message));
    }
  }

  async updatePaymentStatus(
    req: AuthRequest,
    res: Response,
  ): Promise<Response> {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json(errorResponse("Insufficient permissions"));
      }

      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const { status } = req.body;

      const result = await paymentService.updatePaymentStatus(id, status);

      if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST).json(result);
      }

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to update payment status", error.message));
    }
  }

  async getPaymentStats(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json(errorResponse("Authentication required"));
      }

      const userId = req.user.role === "ADMIN" ? undefined : req.user.id;

      const result = await paymentService.getPaymentStats(userId);
      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to get payment stats", error.message));
    }
  }

  async refundPayment(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json(errorResponse("Insufficient permissions"));
      }

      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const result = await paymentService.refundPayment(id);

      if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST).json(result);
      }

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to refund payment", error.message));
    }
  }
}