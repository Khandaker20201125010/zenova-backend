import { Router } from "express";
import { ReviewController } from "./review.controller";
import {
  authenticate,
  authorize,
} from "../../shared/middleware/auth.middleware";
import { validate } from "../../shared/middleware/validation.middleware";
import { createReviewSchema, updateReviewSchema } from "./review.validation";

const router = Router();
const reviewController = new ReviewController();

// Public routes
router.get("/product/:productId", reviewController.getProductReviews);
router.get("/recent", reviewController.getRecentReviews);

// User routes
router.post(
  "/",
  authenticate,
  validate(createReviewSchema),
  reviewController.createReview,
);
router.get("/user", authenticate, reviewController.getUserReviews);
router.put(
  "/:id",
  authenticate,
  validate(updateReviewSchema),
  reviewController.updateReview,
);
router.delete("/:id", authenticate, reviewController.deleteReview);

// Admin routes
router.get(
  "/",
  authenticate,
  authorize("ADMIN"),
  reviewController.getAllReviews,
);
router.get(
  "/stats",
  authenticate,
  authorize("ADMIN"),
  reviewController.getReviewStats,
);

export const reviewRoutes = router;
