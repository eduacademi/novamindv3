import express from "express";
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

// Import middleware and routes with explicit .js extensions for Node.js ESM loader compatibility on Vercel
import { corsMiddleware } from "../server/middleware/cors.js";
import { apiLimiter } from "../server/middleware/rateLimit.js";
import { globalErrorHandler } from "../server/middleware/errorHandler.js";

import metadataRoutes from "../server/routes/metadata.js";
import geminiRoutes from "../server/routes/gemini.js";
import extensionRoutes from "../server/routes/extension.js";
import subscriptionRoutes from "../server/routes/subscription.js";
import graphRoutes from "../server/routes/graph.js";
import adminRoutes from "../server/routes/admin.js";

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

export default app;
