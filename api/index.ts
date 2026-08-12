import express from "express";

const app = express();
app.set("trust proxy", 1);
app.use(express.json({ limit: "10mb" }));

// Collect import errors for diagnostics
const importStatus: Record<string, string> = {};

// Health check (always available)
app.all("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

// --- Top-level await: load all modules before exporting app ---

try {
  const { default: dotenv } = await import("dotenv");
  dotenv.config();
  importStatus["dotenv"] = "OK";
} catch (e: any) {
  importStatus["dotenv"] = e?.stack || e?.message || String(e);
}

try {
  const { default: helmet } = await import("helmet");
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));
  importStatus["helmet"] = "OK";
} catch (e: any) {
  importStatus["helmet"] = e?.stack || e?.message || String(e);
}

try {
  const { corsMiddleware } = await import("../server/middleware/cors");
  app.use(corsMiddleware);
  importStatus["cors"] = "OK";
} catch (e: any) {
  importStatus["cors"] = e?.stack || e?.message || String(e);
}

try {
  const { apiLimiter } = await import("../server/middleware/rateLimit");
  app.use("/api/", apiLimiter);
  importStatus["rateLimit"] = "OK";
} catch (e: any) {
  importStatus["rateLimit"] = e?.stack || e?.message || String(e);
}

try {
  const { default: metadataRoutes } = await import("../server/routes/metadata");
  app.use("/api", metadataRoutes);
  app.use(metadataRoutes);
  importStatus["metadata"] = "OK";
} catch (e: any) {
  importStatus["metadata"] = e?.stack || e?.message || String(e);
}

try {
  const { default: geminiRoutes } = await import("../server/routes/gemini");
  app.use("/api", geminiRoutes);
  app.use(geminiRoutes);
  importStatus["gemini"] = "OK";
} catch (e: any) {
  importStatus["gemini"] = e?.stack || e?.message || String(e);
}

try {
  const { default: extensionRoutes } = await import("../server/routes/extension");
  app.use("/api", extensionRoutes);
  app.use(extensionRoutes);
  importStatus["extension"] = "OK";
} catch (e: any) {
  importStatus["extension"] = e?.stack || e?.message || String(e);
}

try {
  const { default: subscriptionRoutes } = await import("../server/routes/subscription");
  app.use("/api", subscriptionRoutes);
  app.use(subscriptionRoutes);
  importStatus["subscription"] = "OK";
} catch (e: any) {
  importStatus["subscription"] = e?.stack || e?.message || String(e);
}

try {
  const { default: graphRoutes } = await import("../server/routes/graph");
  app.use("/api", graphRoutes);
  app.use(graphRoutes);
  importStatus["graph"] = "OK";
} catch (e: any) {
  importStatus["graph"] = e?.stack || e?.message || String(e);
}

try {
  const { default: adminRoutes } = await import("../server/routes/admin");
  app.use("/api", adminRoutes);
  app.use(adminRoutes);
  importStatus["admin"] = "OK";
} catch (e: any) {
  importStatus["admin"] = e?.stack || e?.message || String(e);
}

try {
  const { globalErrorHandler } = await import("../server/middleware/errorHandler");
  app.use(globalErrorHandler);
  importStatus["errorHandler"] = "OK";
} catch (e: any) {
  importStatus["errorHandler"] = e?.stack || e?.message || String(e);
}

// Diagnostic endpoint - always available, shows import status for ALL modules
app.all("/api/diag", (_req, res) => {
  const errors = Object.entries(importStatus).filter(([, v]) => v !== "OK");
  res.json({
    totalModules: Object.keys(importStatus).length,
    loaded: Object.values(importStatus).filter(v => v === "OK").length,
    failed: errors.length,
    status: importStatus,
    errors: Object.fromEntries(errors),
  });
});

export default app;
