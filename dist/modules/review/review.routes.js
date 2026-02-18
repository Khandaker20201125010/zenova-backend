"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewRoutes = void 0;
const express_1 = require("express");
const review_controller_1 = require("./review.controller");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const validation_middleware_1 = require("../../shared/middleware/validation.middleware");
const review_validation_1 = require("./review.validation");
const router = (0, express_1.Router)();
const reviewController = new review_controller_1.ReviewController();
// Public routes
router.get("/product/:productId", reviewController.getProductReviews);
router.get("/recent", reviewController.getRecentReviews);
// User routes
router.post("/", auth_middleware_1.authenticate, (0, validation_middleware_1.validate)(review_validation_1.createReviewSchema), reviewController.createReview);
router.get("/user", auth_middleware_1.authenticate, reviewController.getUserReviews);
router.put("/:id", auth_middleware_1.authenticate, (0, validation_middleware_1.validate)(review_validation_1.updateReviewSchema), reviewController.updateReview);
router.delete("/:id", auth_middleware_1.authenticate, reviewController.deleteReview);
// Admin routes
router.get("/", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), reviewController.getAllReviews);
router.get("/stats", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), reviewController.getReviewStats);
exports.reviewRoutes = router;
//# sourceMappingURL=review.routes.js.map