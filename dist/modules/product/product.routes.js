"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRoutes = void 0;
const express_1 = require("express");
const product_controller_1 = require("./product.controller");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const validation_middleware_1 = require("../../shared/middleware/validation.middleware");
const product_validation_1 = require("./product.validation");
const upload_middleware_1 = require("../../shared/middleware/upload.middleware");
const router = (0, express_1.Router)();
const productController = new product_controller_1.ProductController();
// Public routes
router.get("/", productController.getProducts);
router.get("/featured", productController.getFeaturedProducts);
router.get("/slug/:slug", productController.getProductBySlug);
router.get("/:id/related", productController.getRelatedProducts);
// Protected routes
router.get("/favorites", auth_middleware_1.authenticate, productController.getUserFavorites);
router.post("/favorites/toggle", auth_middleware_1.authenticate, productController.toggleFavorite);
// Admin routes
router.post("/", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), (0, validation_middleware_1.validate)(product_validation_1.createProductSchema), productController.createProduct);
router.get("/stats", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), productController.getProductStats);
router.get("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), productController.getProductById);
router.put("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), (0, validation_middleware_1.validate)(product_validation_1.updateProductSchema), productController.updateProduct);
router.delete("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), productController.deleteProduct);
router.post("/:id/images", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), upload_middleware_1.uploadMiddleware.multiple("images", 10), productController.uploadProductImages);
router.delete("/:id/images", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), productController.removeProductImage);
exports.productRoutes = router;
//# sourceMappingURL=product.routes.js.map