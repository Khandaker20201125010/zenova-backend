import { Router } from 'express';
import { PaymentController } from './payment.controller';
import { validate } from '../../middleware/validation.middleware';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { createPaymentSchema } from './payment.validation';


const router = Router();
const paymentController = new PaymentController();

// User routes
router.post('/intent', authenticate, validate(createPaymentSchema), paymentController.createPaymentIntent);
router.get('/user', authenticate, paymentController.getPayments);
router.get('/stats', authenticate, paymentController.getPaymentStats);
router.get('/:id', authenticate, paymentController.getPaymentById);

// Admin routes
router.get('/', authenticate, authorize('ADMIN'), paymentController.getPayments);
router.put('/:id/status', authenticate, authorize('ADMIN'), paymentController.updatePaymentStatus);
router.post('/:id/refund', authenticate, authorize('ADMIN'), paymentController.refundPayment);

export const paymentRoutes = router;