"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blogRoutes = void 0;
const express_1 = require("express");
const blog_controller_1 = require("./blog.controller");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const upload_middleware_1 = require("../../shared/middleware/upload.middleware");
const validation_middleware_1 = require("../../shared/middleware/validation.middleware");
const blog_validation_1 = require("./blog.validation");
const router = (0, express_1.Router)();
const blogController = new blog_controller_1.BlogController();
// Public routes
router.get("/", blogController.getPosts);
router.get("/featured", blogController.getFeaturedPosts);
router.get("/recent", blogController.getRecentPosts);
router.get("/categories", blogController.getCategories);
router.get("/tags", blogController.getTags);
router.get("/slug/:slug", blogController.getPostBySlug);
// User routes
router.post("/upload", auth_middleware_1.authenticate, upload_middleware_1.uploadMiddleware.single("coverImage"), blogController.uploadCoverImage);
// Author/Admin routes
router.post("/", auth_middleware_1.authenticate, (0, validation_middleware_1.validate)(blog_validation_1.createBlogPostSchema), blogController.createPost);
router.get("/:id", auth_middleware_1.authenticate, blogController.getPostById);
router.put("/:id", auth_middleware_1.authenticate, (0, validation_middleware_1.validate)(blog_validation_1.updateBlogPostSchema), blogController.updatePost);
router.delete("/:id", auth_middleware_1.authenticate, blogController.deletePost);
// Admin only routes
router.get("/stats", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), blogController.getBlogStats);
exports.blogRoutes = router;
//# sourceMappingURL=blog.routes.js.map