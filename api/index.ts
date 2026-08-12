// Vercel runs api/index.ts as ESM — use top-level await to ensure all routes
// are mounted synchronously before the module finishes loading.
// This eliminates the race condition where requests arrive before routes are ready.

import express from "express";

const app = express();
app.set("trust proxy", 1);
app.use(express.json({ limit: "10mb" }));

// Health check (always available)
app.all("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

// --- Top-level await: load all modules before exporting app ---

try {
  const { default: dotenv } = await import("dotenv");
  dotenv.config();
} catch (_) {}

try {
  const { default: helmet } = await import("helmet");
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));
} catch (_) {}

try {
  const { corsMiddleware } = await import("../server/middleware/cors");
  app.use(corsMiddleware);
} catch (_) {}

try {
  const { apiLimiter } = await import("../server/middleware/rateLimit");
  app.use("/api/", apiLimiter);
} catch (_) {}

// Route modules
try {
  const { default: metadataRoutes } = await import("../server/routes/metadata");
  app.use("/api", metadataRoutes);
  app.use(metadataRoutes);
} catch (e: any) {
  console.warn("⚠️ metadata routes:", e?.message);
}

try {
  const { default: geminiRoutes } = await import("../server/routes/gemini");
  app.use("/api", geminiRoutes);
  app.use(geminiRoutes);
} catch (e: any) {
  console.warn("⚠️ gemini routes:", e?.message);
}

try {
  const { default: extensionRoutes } = await import("../server/routes/extension");
  app.use("/api", extensionRoutes);
  app.use(extensionRoutes);
} catch (e: any) {
  console.warn("⚠️ extension routes:", e?.message);
}

try {
  const { default: subscriptionRoutes } = await import("../server/routes/subscription");
  app.use("/api", subscriptionRoutes);
  app.use(subscriptionRoutes);
} catch (e: any) {
  console.warn("⚠️ subscription routes:", e?.message);
}

try {
  const { default: graphRoutes } = await import("../server/routes/graph");
  app.use("/api", graphRoutes);
  app.use(graphRoutes);
} catch (e: any) {
  console.warn("⚠️ graph routes:", e?.message);
}

try {
  const { default: adminRoutes } = await import("../server/routes/admin");
  app.use("/api", adminRoutes);
  app.use(adminRoutes);
} catch (e: any) {
  console.warn("⚠️ admin routes:", e?.message);
}

try {
  const { globalErrorHandler } = await import("../server/middleware/errorHandler");
  app.use(globalErrorHandler);
} catch (_) {}

// Export the fully initialized Express app directly (no async wrapper)
export default app;
