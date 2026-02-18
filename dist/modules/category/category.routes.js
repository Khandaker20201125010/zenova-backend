"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const category_controller_1 = require("./category.controller");
const router = (0, express_1.Router)();
const categoryController = new category_controller_1.CategoryController();
// Public routes
router.get("/", categoryController.getCategories);
router.get("/tree", categoryController.getCategoryTree);
router.get("/slug/:slug", categoryController.getCategoryBySlug);
router.get("/:slug/products", categoryController.getCategoryProducts);
// Admin routes
router.post("/", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), categoryController.createCategory);
router.put("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), categoryController.updateCategory);
router.delete("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), categoryController.deleteCategory);
exports.categoryRoutes = router;
//# sourceMappingURL=category.routes.js.map