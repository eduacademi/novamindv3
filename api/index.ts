import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.set("trust proxy", 1);

// Security & Parsing Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(express.json({ limit: "10mb" }));

// Health check endpoint
app.all("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

// Import middleware and routes using standard TypeScript extensionless paths so @vercel/nft traces them
import { corsMiddleware } from "../server/middleware/cors";
import { apiLimiter } from "../server/middleware/rateLimit";
import { globalErrorHandler } from "../server/middleware/errorHandler";

import metadataRoutes from "../server/routes/metadata";
import geminiRoutes from "../server/routes/gemini";
import extensionRoutes from "../server/routes/extension";
import subscriptionRoutes from "../server/routes/subscription";
import graphRoutes from "../server/routes/graph";
import adminRoutes from "../server/routes/admin";

app.use(corsMiddleware);
app.use("/api/", apiLimiter);

// Mount routes at both /api prefix and root for Vercel rewrite compatibility
app.use("/api", metadataRoutes);
app.use(metadataRoutes);

app.use("/api", geminiRoutes);
app.use(geminiRoutes);

app.use("/api", extensionRoutes);
app.use(extensionRoutes);

app.use("/api", subscriptionRoutes);
app.use(subscriptionRoutes);

app.use("/api", graphRoutes);
app.use(graphRoutes);

app.use("/api", adminRoutes);
app.use(adminRoutes);

// Global Error Handler
app.use(globalErrorHandler);

// Export for both CommonJS (Vercel) and ESM compatibility
module.exports = app;
export default app;
