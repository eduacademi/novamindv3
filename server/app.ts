import "dotenv/config";
import express from "express";
import helmet from "helmet";

import { corsMiddleware } from "./middleware/cors";
import { apiLimiter } from "./middleware/rateLimit";
import { globalErrorHandler } from "./middleware/errorHandler";

import metadataRoutes from "./routes/metadata";
import geminiRoutes from "./routes/gemini";
import subscriptionRoutes from "./routes/subscription";
import graphRoutes from "./routes/graph";
import adminRoutes from "./routes/admin";

/**
 * The API app without any listener, so it can run both as a long-lived server
 * (server/index.ts) and as a Vercel serverless function (api/index.ts).
 */
const app = express();
app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(
  helmet({
    contentSecurityPolicy: false, // SPA + embeds (YouTube, TikTok, Instagram) need a custom CSP
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  })
);
app.use("/api", corsMiddleware);
app.use("/api", express.json({ limit: "2mb" }));
app.use("/api", apiLimiter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

app.use("/api", metadataRoutes);
app.use("/api", geminiRoutes);
app.use("/api", subscriptionRoutes);
app.use("/api", graphRoutes);
app.use("/api", adminRoutes);

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "API rotası bulunamadı." });
});

app.use(globalErrorHandler);

export default app;
