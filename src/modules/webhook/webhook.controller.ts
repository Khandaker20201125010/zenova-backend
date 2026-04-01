import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { WebhookService } from "./webhook.service";
import { errorResponse, successResponse } from "../../shared/helpers/apiResponse";
import logger from "../../shared/helpers/logger";

const webhookService = new WebhookService();

export class WebhookController {
  async handleStripeWebhook(req: Request, res: Response): Promise<Response> {
    try {
      const signature = req.headers["stripe-signature"] as string;

      // Validate Stripe signature
      if (!signature) {
        logger.warn("Webhook called without Stripe signature");
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json(errorResponse("Stripe signature required"));
      }

      // Optional: Add IP whitelisting for production
      const stripeIps = [
        '54.187.174.169', '54.187.205.235', '54.187.216.72',
        '54.187.226.26', '54.187.227.45', '54.187.228.126'
      ];
      const clientIp = req.ip || req.socket.remoteAddress;
      
      // Only check in production
      if (process.env.NODE_ENV === 'production' && clientIp) {
        const isStripeIp = stripeIps.some(ip => clientIp.includes(ip));
        if (!isStripeIp) {
          logger.warn(`Webhook called from non-Stripe IP: ${clientIp}`);
          // Don't block, just log - Stripe can use multiple IPs
        }
      }

      // Process the webhook
      const result = await webhookService.handleStripeWebhook(
        req.body, // Raw buffer from express.raw()
        signature
      );

      if (!result.success) {
        logger.error(`Webhook processing failed: ${result.message}`);
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json(errorResponse(result.message));
      }

      logger.info(`Webhook processed successfully: ${result.message}`);
      return res
        .status(StatusCodes.OK)
        .json(successResponse("Webhook processed successfully", result));
    } catch (error: any) {
      logger.error("Webhook processing error:", error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Webhook processing failed", error.message));
    }
  }
}