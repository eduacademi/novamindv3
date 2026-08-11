import express from "express";
import helmet from "helmet";
import dotenv from "dotenv";

import { corsMiddleware } from "../server/middleware/cors";
import { apiLimiter } from "../server/middleware/rateLimit";
import { globalErrorHandler } from "../server/middleware/errorHandler";

import metadataRoutes from "../server/routes/metadata";
import geminiRoutes from "../server/routes/gemini";
import extensionRoutes from "../server/routes/extension";
import subscriptionRoutes from "../server/routes/subscription";
import graphRoutes from "../server/routes/graph";

dotenv.config();

const app = express();
app.set("trust proxy", 1);

// Security & Parsing Middlewares
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(corsMiddleware);
app.use(express.json({ limit: "10mb" }));

// Rate Limiter for all API routes
app.use("/api/", apiLimiter);

// Route Modules
app.use("/api", metadataRoutes);
app.use("/api", geminiRoutes);
app.use("/api", extensionRoutes);
app.use("/api", subscriptionRoutes);
app.use("/api", graphRoutes);

// Global Error Handler
app.use(globalErrorHandler);

export default app;
