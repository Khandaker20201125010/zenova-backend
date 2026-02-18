"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCheckoutSession = exports.createStripeCustomer = exports.stripe = void 0;
const stripe_1 = __importDefault(require("stripe"));
const config_1 = require("../config");
exports.stripe = new stripe_1.default(config_1.config.STRIPE.SECRET_KEY, {
    apiVersion: "2025-12-15.clover",
    typescript: true,
});
const createStripeCustomer = async (email, name) => {
    const customer = await exports.stripe.customers.create({
        email,
        name,
    });
    return customer.id;
};
exports.createStripeCustomer = createStripeCustomer;
const createCheckoutSession = async (customerId, priceId, metadata = {}) => {
    const session = await exports.stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        mode: "subscription",
        success_url: `${config_1.config.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${config_1.config.FRONTEND_URL}/payment/cancel`,
        metadata,
    });
    return session;
};
exports.createCheckoutSession = createCheckoutSession;
//# sourceMappingURL=stripe.js.map