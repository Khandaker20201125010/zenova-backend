import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { PaymentService } from './payment.service';
import { AuthRequest } from '../../types';
import { errorResponse } from '../../helpers/apiResponse';


const paymentService = new PaymentService();

export class PaymentController {
  async createPaymentIntent(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(StatusCodes.UNAUTHORIZED).json(
          errorResponse('Authentication required')
        );
      }

      const result = await paymentService.createPaymentIntent(req.user.id, req.body);
      res.status(StatusCodes.CREATED).json(result);
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to create payment intent', error.message)
      );
    }
  }

  async getPayments(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(StatusCodes.UNAUTHORIZED).json(
          errorResponse('Authentication required')
        );
      }

      // Check if user is admin - if yes, return all payments
      const userId = req.user.role === 'ADMIN' ? undefined : req.user.id;
      
      const result = await paymentService.getPayments(req.query, userId);
      res.status(StatusCodes.OK).json(result);
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to get payments', error.message)
      );
    }
  }

  async getPaymentById(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(StatusCodes.UNAUTHORIZED).json(
          errorResponse('Authentication required')
        );
      }

      const { id } = req.params;
      
      // Check if user is admin or owns the payment
      const userId = req.user.role === 'ADMIN' ? undefined : req.user.id;
      
      const result = await paymentService.getPaymentById(id, userId);
      
      if (!result.success) {
        return res.status(StatusCodes.NOT_FOUND).json(result);
      }

      res.status(StatusCodes.OK).json(result);
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to get payment', error.message)
      );
    }
  }

  async updatePaymentStatus(req: AuthRequest, res: Response) {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(StatusCodes.FORBIDDEN).json(
          errorResponse('Insufficient permissions')
        );
      }

      const { id } = req.params;
      const { status } = req.body;
      
      const result = await paymentService.updatePaymentStatus(id, status);
      
      if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST).json(result);
      }

      res.status(StatusCodes.OK).json(result);
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to update payment status', error.message)
      );
    }
  }

  async getPaymentStats(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(StatusCodes.UNAUTHORIZED).json(
          errorResponse('Authentication required')
        );
      }

      // Check if user is admin - if yes, return all stats
      const userId = req.user.role === 'ADMIN' ? undefined : req.user.id;
      
      const result = await paymentService.getPaymentStats(userId);
      res.status(StatusCodes.OK).json(result);
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to get payment stats', error.message)
      );
    }
  }

  async refundPayment(req: AuthRequest, res: Response) {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(StatusCodes.FORBIDDEN).json(
          errorResponse('Insufficient permissions')
        );
      }

      const { id } = req.params;
      const result = await paymentService.refundPayment(id);
      
      if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST).json(result);
      }

      res.status(StatusCodes.OK).json(result);
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
        errorResponse('Failed to refund payment', error.message)
      );
    }
  }
}