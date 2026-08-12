import express from "express";
import helmet from "helmet";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.set("trust proxy", 1);

// Security & Parsing Middlewares
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(express.json({ limit: "10mb" }));

// Debug endpoint to verify function is alive (always available)
app.all("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now(), env: process.env.NODE_ENV || "unknown" });
});

// Wrap all route imports in try-catch to identify which module crashes
let loadError: string | null = null;

try {
  // Step-by-step lazy imports to isolate crashes
  const { corsMiddleware } = require("../server/middleware/cors");
  const { apiLimiter } = require("../server/middleware/rateLimit");
  const { globalErrorHandler } = require("../server/middleware/errorHandler");

  app.use(corsMiddleware);
  app.use("/api/", apiLimiter);

  const metadataRoutes = require("../server/routes/metadata").default;
  const geminiRoutes = require("../server/routes/gemini").default;
  const extensionRoutes = require("../server/routes/extension").default;
  const subscriptionRoutes = require("../server/routes/subscription").default;
  const graphRoutes = require("../server/routes/graph").default;
  const adminRoutes = require("../server/routes/admin").default;

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
} catch (err: any) {
  loadError = err?.stack || err?.message || String(err);
  console.error("❌ CRITICAL: Route loading failed:", loadError);

  // Catch-all route that returns the actual error so we can debug
  app.use((_req, res) => {
    res.status(500).json({
      error: "Module load failure",
      detail: loadError,
    });
  });
}

export default app;
