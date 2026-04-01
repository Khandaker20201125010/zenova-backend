import { Router } from "express";
import { authRoutes } from "../../../modules/auth/auth.routes";
import { userRoutes } from "../../../modules/user/user.routes";
import { productRoutes } from "../../../modules/product/product.routes";
import { orderRoutes } from "../../../modules/order/order.routes";
import { paymentRoutes } from "../../../modules/payment/payment.routes";
import notificationRoutes from "../../../modules/notification/notification.routes";
import { contactRoutes } from "../../../modules/contact/contact.routes";
import { blogRoutes } from "../../../modules/blog/blog.routes";
import { categoryRoutes } from "../../../modules/category/category.routes";
import { reviewRoutes } from "../../../modules/review/review.routes";
import { settingsRoutes } from "../../../modules/settings/settings.routes";
import { dashboardRoutes } from "../../../modules/dashboard/dashboard.routes";


// import other feature routes

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/products", productRoutes);
router.use("/orders", orderRoutes);
router.use("/payments", paymentRoutes);
router.use("/notifications", notificationRoutes);
router.use("/contacts", contactRoutes);
router.use("/blogs", blogRoutes);
router.use("/categories", categoryRoutes);
router.use("/reviews", reviewRoutes);
router.use("/settings", settingsRoutes);
router.use("/dashboard", dashboardRoutes);
// use other feature routes

export default router;
