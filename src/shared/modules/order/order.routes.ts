import { Router } from 'express';
import { OrderController } from './order.controller';

import { createOrderSchema, updateOrderStatusSchema } from './order.validation';
import { validate } from '../../middleware/validation.middleware';
import { authenticate, authorize } from '../../middleware/auth.middleware';


const router = Router();
const orderController = new OrderController();

// Public webhook (no authentication needed for Stripe)
router.post('/webhook', orderController.handleStripeWebhook);

// User routes
router.post('/', authenticate, validate(createOrderSchema), orderController.createOrder);
router.get('/user', authenticate, orderController.getUserOrders);
router.get('/stats', authenticate, orderController.getOrderStats);
router.get('/:id', authenticate, orderController.getOrderById);
router.get('/number/:orderNumber', authenticate, orderController.getOrderByNumber);
router.post('/:id/cancel', authenticate, orderController.cancelOrder);
router.post('/:id/checkout', authenticate, orderController.createCheckoutSession);

// Admin routes
router.get('/', authenticate, authorize('ADMIN'), orderController.getOrders);
router.put('/:id/status', authenticate, authorize('ADMIN'), validate(updateOrderStatusSchema), orderController.updateOrderStatus);

export const orderRoutes = router;