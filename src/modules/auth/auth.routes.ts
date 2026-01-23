import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validate } from "../../shared/middleware/validation.middleware";
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordConfirmSchema,
  resetPasswordSchema,
  socialLoginSchema,
} from "./auth.validation";
import { authenticate } from "../../shared/middleware/auth.middleware";

const router = Router();
const authController = new AuthController();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post(
  "/social-login",
  validate(socialLoginSchema),
  authController.socialLogin,
);
router.post("/demo-login", authController.demoLogin);
router.post("/refresh-token", authController.refreshToken);
router.post(
  "/request-password-reset",
  validate(resetPasswordSchema),
  authController.requestPasswordReset,
);
router.post(
  "/reset-password",
  validate(resetPasswordConfirmSchema),
  authController.resetPassword,
);

// Protected routes
router.post("/logout", authenticate, authController.logout);
router.post(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword,
);
router.get("/me", authenticate, authController.me);

export const authRoutes = router;
