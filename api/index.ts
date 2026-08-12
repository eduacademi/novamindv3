import express from "express";

const app = express();
app.set("trust proxy", 1);
app.use(express.json({ limit: "10mb" }));

// Health check endpoint
app.all("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

// Initialize all route modules using dynamic import() for Vercel ESM runtime
async function initializeRoutes() {
  try {
    const dotenvModule = await import("dotenv");
    dotenvModule.config();
  } catch (_) {}

  try {
    const helmetModule = await import("helmet");
    app.use(helmetModule.default({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" }
    }));
  } catch (_) {}

  try {
    const corsModule = await import("../server/middleware/cors");
    app.use(corsModule.corsMiddleware);
  } catch (_) {}

  try {
    const rateLimitModule = await import("../server/middleware/rateLimit");
    app.use("/api/", rateLimitModule.apiLimiter);
  } catch (_) {}

  // Route modules
  const routeModules = [
    "../server/routes/metadata",
    "../server/routes/gemini",
    "../server/routes/extension",
    "../server/routes/subscription",
    "../server/routes/graph",
    "../server/routes/admin",
  ];

  for (const modPath of routeModules) {
    try {
      const mod = await import(modPath);
      const router = mod.default || mod;
      if (typeof router === "function") {
        app.use("/api", router);
        app.use(router);
      }
    } catch (e: any) {
      console.warn(`⚠️ Failed to load route module ${modPath}:`, e?.message);
    }
  }

  try {
    const errorModule = await import("../server/middleware/errorHandler");
    app.use(errorModule.globalErrorHandler);
  } catch (_) {}
}

// Initialize routes
const initPromise = initializeRoutes();

// Vercel handler: ensure routes are loaded before handling requests
const handler = async (req: any, res: any) => {
  await initPromise;
  return app(req, res);
};

export default handler;
