import express from "express";

const app = express();
app.set("trust proxy", 1);
app.use(express.json({ limit: "10mb" }));

// Health check endpoint
app.all("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

// Initialize all route modules using static dynamic import() for Vercel ESM runtime.
// Each import path MUST be a static string literal so Vercel's bundler (nft) can trace them.
async function initializeRoutes() {
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

  // Route modules - each import is a static string literal for bundler traceability
  try {
    const { default: metadataRoutes } = await import("../server/routes/metadata");
    app.use("/api", metadataRoutes);
    app.use(metadataRoutes);
  } catch (e: any) {
    console.warn("⚠️ Failed to load metadata routes:", e?.message);
  }

  try {
    const { default: geminiRoutes } = await import("../server/routes/gemini");
    app.use("/api", geminiRoutes);
    app.use(geminiRoutes);
  } catch (e: any) {
    console.warn("⚠️ Failed to load gemini routes:", e?.message);
  }

  try {
    const { default: extensionRoutes } = await import("../server/routes/extension");
    app.use("/api", extensionRoutes);
    app.use(extensionRoutes);
  } catch (e: any) {
    console.warn("⚠️ Failed to load extension routes:", e?.message);
  }

  try {
    const { default: subscriptionRoutes } = await import("../server/routes/subscription");
    app.use("/api", subscriptionRoutes);
    app.use(subscriptionRoutes);
  } catch (e: any) {
    console.warn("⚠️ Failed to load subscription routes:", e?.message);
  }

  try {
    const { default: graphRoutes } = await import("../server/routes/graph");
    app.use("/api", graphRoutes);
    app.use(graphRoutes);
  } catch (e: any) {
    console.warn("⚠️ Failed to load graph routes:", e?.message);
  }

  try {
    const { default: adminRoutes } = await import("../server/routes/admin");
    app.use("/api", adminRoutes);
    app.use(adminRoutes);
  } catch (e: any) {
    console.warn("⚠️ Failed to load admin routes:", e?.message);
  }

  try {
    const { globalErrorHandler } = await import("../server/middleware/errorHandler");
    app.use(globalErrorHandler);
  } catch (_) {}
}

// Initialize routes once
const initPromise = initializeRoutes();

// Vercel handler: ensure routes are loaded before handling any request
const handler = async (req: any, res: any) => {
  await initPromise;
  return app(req, res);
};

export default handler;
