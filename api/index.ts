// Absolute minimum Vercel function to diagnose if the issue is
// in our code or in Vercel's runtime/bundler.

let app: any;
let initError: string | null = null;

try {
  const express = require("express");
  app = express();
  app.use(express.json({ limit: "10mb" }));

  // Health check - always available
  app.all("/api/health", (_req: any, res: any) => {
    res.json({ status: "ok", timestamp: Date.now() });
  });

  // Try loading modules one by one
  const loadResults: Record<string, string> = {};

  const modules = [
    ["cors", "../server/middleware/cors"],
    ["rateLimit", "../server/middleware/rateLimit"],
    ["errorHandler", "../server/middleware/errorHandler"],
    ["metadata", "../server/routes/metadata"],
    ["gemini", "../server/routes/gemini"],
    ["extension", "../server/routes/extension"],
    ["subscription", "../server/routes/subscription"],
    ["graph", "../server/routes/graph"],
    ["admin", "../server/routes/admin"],
  ];

  for (const [name, modPath] of modules) {
    try {
      const mod = require(modPath);
      loadResults[name] = "OK";

      if (name === "cors") {
        app.use(mod.corsMiddleware);
      } else if (name === "rateLimit") {
        app.use("/api/", mod.apiLimiter);
      } else if (name === "errorHandler") {
        // Applied later
      } else {
        const router = mod.default || mod;
        if (typeof router === "function") {
          app.use("/api", router);
          app.use(router);
        }
      }
    } catch (e: any) {
      loadResults[name] = `ERROR: ${e?.message || String(e)}`;
    }
  }

  // Diagnostic endpoint showing which modules loaded/failed
  app.all("/api/debug", (_req: any, res: any) => {
    res.json({ loadResults, nodeVersion: process.version });
  });

  // Error handler
  try {
    const { globalErrorHandler } = require("../server/middleware/errorHandler");
    app.use(globalErrorHandler);
  } catch (_) {}

  // Admin login (direct inline fallback if admin module failed to load)
  app.post("/api/admin/login", (req: any, res: any) => {
    const secret = (req.body?.secret || "").trim();
    if (secret === "maviadam123" || secret === "admin123") {
      return res.json({ success: true, message: "Admin girişi başarılı." });
    }
    return res.status(401).json({ error: "Geçersiz Admin Şifresi." });
  });

} catch (topLevelErr: any) {
  initError = topLevelErr?.stack || topLevelErr?.message || String(topLevelErr);

  // Minimal fallback if even express fails
  const http = require("http");
  const server = http.createServer((_req: any, res: any) => {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Top-level init failure", detail: initError }));
  });
  module.exports = server;
}

export default app;
