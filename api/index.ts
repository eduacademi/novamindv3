import express from "express";

const app = express();
app.set("trust proxy", 1);
app.use(express.json({ limit: "10mb" }));

// Health check - always available
app.all("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now(), nodeVersion: process.version });
});

// Load all modules asynchronously with error isolation
const loadResults: Record<string, string> = {};

async function initializeRoutes() {
  try {
    const dotenvModule = await import("dotenv");
    dotenvModule.config();
    loadResults["dotenv"] = "OK";
  } catch (e: any) {
    loadResults["dotenv"] = `ERROR: ${e.message}`;
  }

  try {
    const helmetModule = await import("helmet");
    app.use(helmetModule.default({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" }
    }));
    loadResults["helmet"] = "OK";
  } catch (e: any) {
    loadResults["helmet"] = `ERROR: ${e.message}`;
  }

  try {
    const corsModule = await import("../server/middleware/cors");
    app.use(corsModule.corsMiddleware);
    loadResults["cors"] = "OK";
  } catch (e: any) {
    loadResults["cors"] = `ERROR: ${e.message}`;
  }

  try {
    const rateLimitModule = await import("../server/middleware/rateLimit");
    app.use("/api/", rateLimitModule.apiLimiter);
    loadResults["rateLimit"] = "OK";
  } catch (e: any) {
    loadResults["rateLimit"] = `ERROR: ${e.message}`;
  }

  // Route modules
  const routeModules = [
    { name: "metadata", path: "../server/routes/metadata" },
    { name: "gemini", path: "../server/routes/gemini" },
    { name: "extension", path: "../server/routes/extension" },
    { name: "subscription", path: "../server/routes/subscription" },
    { name: "graph", path: "../server/routes/graph" },
    { name: "admin", path: "../server/routes/admin" },
  ];

  for (const { name, path } of routeModules) {
    try {
      const mod = await import(path);
      const router = mod.default || mod;
      if (typeof router === "function") {
        app.use("/api", router);
        app.use(router);
      }
      loadResults[name] = "OK";
    } catch (e: any) {
      loadResults[name] = `ERROR: ${e.message}`;
    }
  }

  try {
    const errorModule = await import("../server/middleware/errorHandler");
    app.use(errorModule.globalErrorHandler);
    loadResults["errorHandler"] = "OK";
  } catch (e: any) {
    loadResults["errorHandler"] = `ERROR: ${e.message}`;
  }

  // Inline admin login fallback in case admin module failed
  app.post("/api/admin/login-fallback", (req, res) => {
    const secret = (req.body?.secret || "").trim();
    if (secret === "maviadam123" || secret === "admin123") {
      return res.json({ success: true, message: "Admin girişi başarılı." });
    }
    return res.status(401).json({ error: "Geçersiz Admin Şifresi." });
  });

  // Debug endpoint showing which modules loaded
  app.all("/api/debug", (_req, res) => {
    res.json({ loadResults, nodeVersion: process.version });
  });
}

// Initialize routes
const initPromise = initializeRoutes();

// Vercel handler export - ensure routes are loaded before handling requests
const handler = async (req: any, res: any) => {
  await initPromise;
  return app(req, res);
};

export default handler;
