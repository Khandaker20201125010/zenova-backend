import { Router } from "express";
import { BlogController } from "./blog.controller";
import {
  authenticate,
  authorize,
} from "../../shared/middleware/auth.middleware";
import { uploadMiddleware } from "../../shared/middleware/upload.middleware";
import { validate } from "../../shared/middleware/validation.middleware";
import { createBlogPostSchema, updateBlogPostSchema } from "./blog.validation";

const router = Router();
const blogController = new BlogController();

// Public routes
router.get("/", blogController.getPosts);
router.get("/featured", blogController.getFeaturedPosts);
router.get("/recent", blogController.getRecentPosts);
router.get("/categories", blogController.getCategories);
router.get("/tags", blogController.getTags);
router.get("/slug/:slug", blogController.getPostBySlug);

// User routes
router.post(
  "/upload",
  authenticate,
  (req, res, next) => {
    // Check if the file is coming as 'coverImage' or 'image'
    const uploadHandler = uploadMiddleware.single('coverImage');
    uploadHandler(req, res, (err) => {
      if (err && err.message?.includes('Unexpected field')) {
        // Try with 'image' field name
        const fallbackHandler = uploadMiddleware.single('image');
        fallbackHandler(req, res, next);
      } else {
        next(err);
      }
    });
  },
  blogController.uploadCoverImage
);

// Author/Admin routes
router.post(
  "/",
  authenticate,
  validate(createBlogPostSchema),
  blogController.createPost,
);
router.get("/:id", authenticate, blogController.getPostById);
router.put(
  "/:id",
  authenticate,
  validate(updateBlogPostSchema),
  blogController.updatePost,
);
router.delete("/:id", authenticate, blogController.deletePost);

// Admin only routes
router.get(
  "/stats",
  authenticate,
  authorize("ADMIN"),
  blogController.getBlogStats,
);

export const blogRoutes = router;
