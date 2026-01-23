import Stripe from "stripe";
import { config } from "../config";

export const stripe = new Stripe(config.STRIPE.SECRET_KEY, {
  apiVersion: "2025-12-15.clover",
  typescript: true,
});

export const createStripeCustomer = async (
  email: string,
  name: string,
): Promise<string> => {
  const customer = await stripe.customers.create({
    email,
    name,
  });

  return customer.id;
};

export const createCheckoutSession = async (
  customerId: string,
  priceId: string,
  metadata: Record<string, any> = {},
) => {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${config.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.FRONTEND_URL}/payment/cancel`,
    metadata,
  });

  return session;
};
