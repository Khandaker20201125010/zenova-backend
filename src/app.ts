import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import {
  errorHandler,
  notFoundHandler,
} from "./shared/middleware/error.middleware";
import { config } from "./config";
import router from "./shared/helpers/routes";
import { webhookRoutes } from "./modules/webhook/webhook.routes";



const app: Application = express();


app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } 
}));
app.use(
  cors({
    origin: config.FRONTEND_URL,
    credentials: true,
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api", limiter);

app.use("/api/v1/webhook", webhookRoutes);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Health check endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use("/api/v1", router);
// Add other route prefixes here

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
