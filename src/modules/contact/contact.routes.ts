import { Router } from "express";

import { ContactController } from "./contact.controller";
import {
  createContactMessageSchema,
  createFaqSchema,
  updateContactMessageSchema,
  updateFaqSchema,
} from "./contact.validation";
import { validate } from "../../shared/middleware/validation.middleware";
import {
  authenticate,
  authorize,
} from "../../shared/middleware/auth.middleware";

const router = Router();
const contactController = new ContactController();

// Public routes
router.post(
  "/messages",
  validate(createContactMessageSchema),
  contactController.createMessage,
);
router.get("/faqs", contactController.getFaqs);

// Admin routes
router.get(
  "/messages",
  authenticate,
  authorize("ADMIN"),
  contactController.getMessages,
);
router.get(
  "/messages/:id",
  authenticate,
  authorize("ADMIN"),
  contactController.getMessageById,
);
router.put(
  "/messages/:id",
  authenticate,
  authorize("ADMIN"),
  validate(updateContactMessageSchema),
  contactController.updateMessage,
);
router.delete(
  "/messages/:id",
  authenticate,
  authorize("ADMIN"),
  contactController.deleteMessage,
);
router.get(
  "/stats",
  authenticate,
  authorize("ADMIN"),
  contactController.getContactStats,
);

// FAQ admin routes
router.post(
  "/faqs",
  authenticate,
  authorize("ADMIN"),
  validate(createFaqSchema),
  contactController.createFaq,
);
router.put(
  "/faqs/:id",
  authenticate,
  authorize("ADMIN"),
  validate(updateFaqSchema),
  contactController.updateFaq,
);
router.delete(
  "/faqs/:id",
  authenticate,
  authorize("ADMIN"),
  contactController.deleteFaq,
);

export const contactRoutes = router;
