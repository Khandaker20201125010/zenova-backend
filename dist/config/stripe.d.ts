import Stripe from "stripe";
export declare const stripe: Stripe;
export declare const createStripeCustomer: (email: string, name: string) => Promise<string>;
export declare const createCheckoutSession: (customerId: string, priceId: string, metadata?: Record<string, any>) => Promise<Stripe.Response<Stripe.Checkout.Session>>;
//# sourceMappingURL=stripe.d.ts.map