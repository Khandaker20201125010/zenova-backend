import { Router } from "express";
import express from "express"; // Add this import
import { WebhookController } from "./webhook.controller";

const router = Router();
const webhookController = new WebhookController();

// Stripe webhook endpoint (no authentication needed)
router.post(
  "/stripe",
  express.raw({ type: 'application/json' }),
  webhookController.handleStripeWebhook
);

export const webhookRoutes = router;