"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactRoutes = void 0;
const express_1 = require("express");
const contact_controller_1 = require("./contact.controller");
const contact_validation_1 = require("./contact.validation");
const validation_middleware_1 = require("../../shared/middleware/validation.middleware");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const router = (0, express_1.Router)();
const contactController = new contact_controller_1.ContactController();
// Public routes
router.post("/messages", (0, validation_middleware_1.validate)(contact_validation_1.createContactMessageSchema), contactController.createMessage);
router.get("/faqs", contactController.getFaqs);
// Admin routes
router.get("/messages", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), contactController.getMessages);
router.get("/messages/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), contactController.getMessageById);
router.put("/messages/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), (0, validation_middleware_1.validate)(contact_validation_1.updateContactMessageSchema), contactController.updateMessage);
router.delete("/messages/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), contactController.deleteMessage);
router.get("/stats", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), contactController.getContactStats);
// FAQ admin routes
router.post("/faqs", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), (0, validation_middleware_1.validate)(contact_validation_1.createFaqSchema), contactController.createFaq);
router.put("/faqs/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), (0, validation_middleware_1.validate)(contact_validation_1.updateFaqSchema), contactController.updateFaq);
router.delete("/faqs/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), contactController.deleteFaq);
exports.contactRoutes = router;
//# sourceMappingURL=contact.routes.js.map