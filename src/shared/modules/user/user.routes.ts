import { Router } from "express";
import { UserController } from "./user.controller";

import {
  updateProfileSchema,
  updateEmailSchema,
  toggleTwoFactorSchema,
} from "./user.validation";

import { validate } from "../../middleware/validation.middleware";
import { uploadMiddleware  } from "../../middleware/upload.middleware";
import { authenticate, authorize } from "../../middleware/auth.middleware";

const router = Router();
const userController = new UserController();

// User profile routes (authenticated)
router.get("/profile", authenticate, userController.getProfile);
router.put(
  "/profile",
  authenticate,
  validate(updateProfileSchema),
  userController.updateProfile,
);
router.put(
  "/email",
  authenticate,
  validate(updateEmailSchema),
  userController.updateEmail,
);
router.put(
  "/two-factor",
  authenticate,
  validate(toggleTwoFactorSchema),
  userController.toggleTwoFactor,
);
router.post("/avatar", authenticate, uploadMiddleware.single('avatar'), userController.uploadAvatar);
router.get("/stats", authenticate, userController.getUserStats);
router.get("/activities", authenticate, userController.getActivities);

// Admin routes
router.get("/", authenticate, authorize("ADMIN"), userController.getUsers);
router.get(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  userController.getUserById,
);
router.put(
  "/:id/status",
  authenticate,
  authorize("ADMIN"),
  userController.updateUserStatus,
);
router.put(
  "/:id/role",
  authenticate,
  authorize("ADMIN"),
  userController.updateUserRole,
);
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  userController.deleteUser,
);

export const userRoutes = router;
