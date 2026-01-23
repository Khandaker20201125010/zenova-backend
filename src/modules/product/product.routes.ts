import { Router } from "express";
import { ProductController } from "./product.controller";
import {
  authenticate,
  authorize,
} from "../../shared/middleware/auth.middleware";
import { validate } from "../../shared/middleware/validation.middleware";
import { createProductSchema, updateProductSchema } from "./product.validation";
import { uploadMiddleware } from "../../shared/middleware/upload.middleware";

const router = Router();
const productController = new ProductController();

// Public routes
router.get("/", productController.getProducts);
router.get("/featured", productController.getFeaturedProducts);
router.get("/slug/:slug", productController.getProductBySlug);
router.get("/:id/related", productController.getRelatedProducts);

// Protected routes
router.get("/favorites", authenticate, productController.getUserFavorites);
router.post(
  "/favorites/toggle",
  authenticate,
  productController.toggleFavorite,
);

// Admin routes
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate(createProductSchema),
  productController.createProduct,
);
router.get(
  "/stats",
  authenticate,
  authorize("ADMIN"),
  productController.getProductStats,
);
router.get(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  productController.getProductById,
);
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(updateProductSchema),
  productController.updateProduct,
);
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  productController.deleteProduct,
);
router.post(
  "/:id/images",
  authenticate,
  authorize("ADMIN"),
  uploadMiddleware.multiple("images", 10),
  productController.uploadProductImages,
);
router.delete(
  "/:id/images",
  authenticate,
  authorize("ADMIN"),
  productController.removeProductImage,
);

export const productRoutes = router;
