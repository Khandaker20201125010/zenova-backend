import { stripe } from "../../config/stripe";
import logger from "../../shared/helpers/logger";
import { prisma } from "../../shared/helpers/prisma";
import { PaymentStatus, OrderStatus } from "@prisma/client";

export class WebhookService {
  async handleStripeWebhook(payload: any, signature: string): Promise<{ success: boolean; message: string }> {
    try {
      // Construct the event using the raw payload and signature
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );

      logger.info(`Processing Stripe webhook: ${event.type} | ID: ${event.id}`);

      // Handle different event types
      switch (event.type) {
        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object;
          await this.handlePaymentSuccess(paymentIntent);
          break;
        }

        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object;
          await this.handlePaymentFailure(paymentIntent);
          break;
        }

        case 'payment_intent.canceled': {
          const paymentIntent = event.data.object;
          await this.handlePaymentCanceled(paymentIntent);
          break;
        }

        case 'checkout.session.completed': {
          const session = event.data.object;
          await this.handleCheckoutComplete(session);
          break;
        }

        case 'charge.refunded': {
          const refund = event.data.object;
          await this.handleRefund(refund);
          break;
        }

        case 'charge.dispute.created': {
          const dispute = event.data.object;
          await this.handleDispute(dispute);
          break;
        }

        default:
          logger.info(`Unhandled event type: ${event.type}`);
      }

      return { success: true, message: "Webhook processed successfully" };
    } catch (error: any) {
      logger.error("Webhook processing error:", error);
      return { success: false, message: error.message };
    }
  }

  private async handlePaymentSuccess(paymentIntent: any) {
    try {
      logger.info(`Processing successful payment: ${paymentIntent.id}`);

      // Find payment by stripePaymentId
      const existingPayment = await prisma.payment.findFirst({
        where: { stripePaymentId: paymentIntent.id },
        include: { user: true, order: true }
      });

      if (!existingPayment) {
        logger.warn(`Payment not found for intent: ${paymentIntent.id}`);
        return;
      }

      // Update payment record
      const payment = await prisma.payment.update({
        where: { id: existingPayment.id },
        data: { 
          status: PaymentStatus.PAID,
          updatedAt: new Date()
        },
        include: { user: true, order: true }
      });

      // Update order payment status if order exists
      if (payment.orderId) {
        await prisma.order.update({
          where: { id: payment.orderId },
          data: { 
            paymentStatus: PaymentStatus.PAID,
            status: OrderStatus.PROCESSING
          }
        });
        logger.info(`Order ${payment.orderId} payment status updated to PAID`);
      }

      // Create notification for user
      await prisma.notification.create({
        data: {
          userId: payment.userId,
          title: "Payment Successful",
          message: `Your payment of ${payment.amount} ${payment.currency.toUpperCase()} has been processed successfully.`,
          type: "SUCCESS",
          data: { 
            paymentId: payment.id,
            amount: payment.amount,
            currency: payment.currency,
            transactionId: paymentIntent.id
          }
        }
      });

      // Log activity
      await prisma.activity.create({
        data: {
          userId: payment.userId,
          action: "PAYMENT_SUCCESS",
          entity: "PAYMENT",
          entityId: payment.id,
          details: {
            amount: payment.amount,
            currency: payment.currency,
            stripePaymentId: paymentIntent.id,
            paymentMethod: paymentIntent.payment_method_types?.[0]
          }
        }
      });

      logger.info(`Payment ${payment.id} marked as PAID successfully`);
    } catch (error: any) {
      logger.error("Error handling payment success:", error);
      throw error;
    }
  }

  private async handlePaymentFailure(paymentIntent: any) {
    try {
      logger.info(`Processing failed payment: ${paymentIntent.id}`);

      const existingPayment = await prisma.payment.findFirst({
        where: { stripePaymentId: paymentIntent.id },
        include: { user: true }
      });

      if (!existingPayment) {
        logger.warn(`Payment not found for intent: ${paymentIntent.id}`);
        return;
      }

      const payment = await prisma.payment.update({
        where: { id: existingPayment.id },
        data: { 
          status: PaymentStatus.FAILED,
          updatedAt: new Date()
        },
        include: { user: true }
      });

      // Create notification for user
      await prisma.notification.create({
        data: {
          userId: payment.userId,
          title: "Payment Failed",
          message: `Your payment of ${payment.amount} ${payment.currency.toUpperCase()} could not be processed. Please try again or use a different payment method.`,
          type: "ERROR",
          data: { 
            paymentId: payment.id,
            amount: payment.amount,
            currency: payment.currency,
            error: paymentIntent.last_payment_error?.message || "Payment processing failed"
          }
        }
      });

      // Log activity
      await prisma.activity.create({
        data: {
          userId: payment.userId,
          action: "PAYMENT_FAILED",
          entity: "PAYMENT",
          entityId: payment.id,
          details: {
            amount: payment.amount,
            currency: payment.currency,
            error: paymentIntent.last_payment_error?.message
          }
        }
      });

      logger.info(`Payment ${payment.id} marked as FAILED`);
    } catch (error: any) {
      logger.error("Error handling payment failure:", error);
      throw error;
    }
  }

  private async handlePaymentCanceled(paymentIntent: any) {
    try {
      logger.info(`Processing canceled payment: ${paymentIntent.id}`);

      const existingPayment = await prisma.payment.findFirst({
        where: { stripePaymentId: paymentIntent.id },
        include: { user: true }
      });

      if (!existingPayment) {
        logger.warn(`Payment not found for intent: ${paymentIntent.id}`);
        return;
      }

      // Only update if still pending
      if (existingPayment.status === PaymentStatus.PENDING) {
        await prisma.payment.update({
          where: { id: existingPayment.id },
          data: { 
            status: PaymentStatus.FAILED,
            updatedAt: new Date()
          }
        });

        logger.info(`Payment ${existingPayment.id} marked as CANCELED`);
      }
    } catch (error: any) {
      logger.error("Error handling payment canceled:", error);
    }
  }

  private async handleCheckoutComplete(session: any) {
    try {
      logger.info(`Processing checkout completion: ${session.id}`);

      const orderId = session.metadata?.orderId;
      
      if (orderId) {
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: { user: true }
        });

        if (order) {
          await prisma.order.update({
            where: { id: orderId },
            data: { 
              paymentStatus: PaymentStatus.PAID,
              status: OrderStatus.PROCESSING,
              stripeSessionId: session.id
            }
          });

          // Create notification for user
          await prisma.notification.create({
            data: {
              userId: order.userId,
              title: "Order Confirmed",
              message: `Your order #${order.orderNumber} has been confirmed and is being processed.`,
              type: "SUCCESS",
              data: { 
                orderId: order.id,
                orderNumber: order.orderNumber,
                sessionId: session.id
              }
            }
          });

          logger.info(`Order ${orderId} payment completed via checkout session`);
        }
      }
    } catch (error: any) {
      logger.error("Error handling checkout complete:", error);
    }
  }

  private async handleRefund(refund: any) {
    try {
      logger.info(`Processing refund: ${refund.id} for payment: ${refund.payment_intent}`);

      const existingPayment = await prisma.payment.findFirst({
        where: { stripePaymentId: refund.payment_intent },
        include: { user: true, order: true }
      });

      if (!existingPayment) {
        logger.warn(`Payment not found for intent: ${refund.payment_intent}`);
        return;
      }

      const payment = await prisma.payment.update({
        where: { id: existingPayment.id },
        data: { 
          status: PaymentStatus.REFUNDED,
          updatedAt: new Date()
        },
        include: { user: true }
      });

      // Update order if exists
      if (payment.orderId) {
        await prisma.order.update({
          where: { id: payment.orderId },
          data: { 
            paymentStatus: PaymentStatus.REFUNDED,
            status: OrderStatus.REFUNDED
          }
        });
      }

      // Create notification for user
      await prisma.notification.create({
        data: {
          userId: payment.userId,
          title: "Payment Refunded",
          message: `Your payment of ${refund.amount / 100} ${refund.currency.toUpperCase()} has been refunded. The amount should appear in your account within 5-10 business days.`,
          type: "INFO",
          data: { 
            paymentId: payment.id,
            refundId: refund.id,
            amount: refund.amount / 100,
            currency: refund.currency,
            reason: refund.reason
          }
        }
      });

      // Log activity
      await prisma.activity.create({
        data: {
          userId: payment.userId,
          action: "PAYMENT_REFUNDED",
          entity: "PAYMENT",
          entityId: payment.id,
          details: {
            amount: refund.amount / 100,
            currency: refund.currency,
            reason: refund.reason,
            refundId: refund.id
          }
        }
      });

      logger.info(`Payment ${payment.id} marked as REFUNDED`);
    } catch (error: any) {
      logger.error("Error handling refund:", error);
      throw error;
    }
  }

  private async handleDispute(dispute: any) {
    try {
      logger.info(`Processing dispute: ${dispute.id} for payment: ${dispute.payment_intent}`);

      const existingPayment = await prisma.payment.findFirst({
        where: { stripePaymentId: dispute.payment_intent },
        include: { user: true }
      });

      if (!existingPayment) {
        logger.warn(`Payment not found for intent: ${dispute.payment_intent}`);
        return;
      }

      // Create notification for admin about dispute
      await prisma.notification.create({
        data: {
          userId: existingPayment.userId,
          title: "Payment Dispute",
          message: `A dispute has been filed for payment of ${existingPayment.amount} ${existingPayment.currency}. Please investigate.`,
          type: "WARNING",
          data: { 
            paymentId: existingPayment.id,
            disputeId: dispute.id,
            reason: dispute.reason,
            amount: existingPayment.amount
          }
        }
      });

      logger.info(`Dispute ${dispute.id} recorded for payment ${existingPayment.id}`);
    } catch (error: any) {
      logger.error("Error handling dispute:", error);
    }
  }
}