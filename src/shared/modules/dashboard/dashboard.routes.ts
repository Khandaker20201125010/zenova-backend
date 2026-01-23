import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { DashboardController } from './dashboard.controller';
import { validate } from '../../middleware/validation.middleware';
import { analyticsQuerySchema } from './dashboard.validation';


const router = Router();
const dashboardController = new DashboardController();

// User dashboard
router.get('/user', authenticate, dashboardController.getUserDashboard);

// Manager dashboard
router.get('/manager', authenticate, authorize('ADMIN', 'MANAGER'), dashboardController.getManagerDashboard);

// Admin dashboards
router.get('/admin', authenticate, authorize('ADMIN'), dashboardController.getAdminDashboard);
router.get('/analytics', authenticate, authorize('ADMIN'), validate(analyticsQuerySchema), dashboardController.getAnalytics);
router.get('/analytics/revenue', authenticate, authorize('ADMIN'), dashboardController.getRevenueAnalytics);
router.get('/analytics/users', authenticate, authorize('ADMIN'), dashboardController.getUserAnalytics);
router.get('/analytics/sales', authenticate, authorize('ADMIN','MANAGER'), dashboardController.getSalesAnalytics);
router.get('/system-status', authenticate, authorize('ADMIN'), dashboardController.getSystemStatus);

export const dashboardRoutes = router;