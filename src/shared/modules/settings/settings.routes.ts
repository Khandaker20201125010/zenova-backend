import { Router } from 'express';
import { SettingsController } from './settings.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { updateSystemSettingsSchema } from './settings.validation';


const router = Router();
const settingsController = new SettingsController();

// Public routes
router.get('/public', settingsController.getPublicSettings);

// Admin routes
router.get('/', authenticate, authorize('ADMIN'), settingsController.getSettings);
router.get('/system', authenticate, authorize('ADMIN'), settingsController.getSystemSettings);
router.get('/:key', authenticate, authorize('ADMIN'), settingsController.getSetting);
router.put('/', authenticate, authorize('ADMIN'), settingsController.updateSetting);
router.put('/multiple', authenticate, authorize('ADMIN'), settingsController.updateMultipleSettings);
router.put('/system', authenticate, authorize('ADMIN'), validate(updateSystemSettingsSchema), settingsController.updateSystemSettings);
router.post('/initialize', authenticate, authorize('ADMIN'), settingsController.initializeSettings);

export const settingsRoutes = router;