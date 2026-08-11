import express from "express";
import path from "path";
import helmet from "helmet";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

import { corsMiddleware } from "./middleware/cors.js";
import { apiLimiter } from "./middleware/rateLimit.js";
import { globalErrorHandler } from "./middleware/errorHandler.js";

import metadataRoutes from "./routes/metadata.js";
import geminiRoutes from "./routes/gemini.js";
import extensionRoutes from "./routes/extension.js";
import subscriptionRoutes from "./routes/subscription.js";
import graphRoutes from "./routes/graph.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Security & Parsing Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for dev/Vite compatibility
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

// Landing page route
app.get("/landing", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "landing.html"));
});

// Global Error Handler
app.use(globalErrorHandler);

// Export app for serverless (Vercel) compatibility
export default app;

// Vite middleware & Static server setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 NovaMind Server running on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

