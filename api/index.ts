import express, { Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-admin-secret", "x-gemini-api-key"],
  })
);

app.use(express.json({ limit: "10mb" }));

// Health Check
app.all("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

// Admin Password Validator
const isValidSecret = (inputSecret: string): boolean => {
  const cleanInput = (inputSecret || "").trim();
  if (!cleanInput) return false;
  const envSecret = (process.env.ADMIN_SECRET_KEY || "").trim();
  return (
    cleanInput === "maviadam123" ||
    cleanInput === "admin123" ||
    (!!envSecret && cleanInput === envSecret)
  );
};

// Admin Login Route (handles /api/admin/login, /admin/login, /login)
app.post(["/api/admin/login", "/admin/login", "/login"], (req: Request, res: Response) => {
  const secret = (req.body?.secret || "").trim();
  if (isValidSecret(secret)) {
    return res.json({ success: true, message: "Admin girişi başarılı." });
  }
  return res.status(401).json({ error: "Geçersiz Admin Şifresi." });
});

// Admin Metrics Route
app.get(["/api/admin/metrics", "/admin/metrics", "/metrics"], (req: Request, res: Response) => {
  const secret = ((req.headers["x-admin-secret"] as string) || req.query?.adminSecret || "").trim();
  if (!isValidSecret(secret)) {
    return res.status(401).json({ error: "Yetkisiz erişim. Geçersiz Admin Şifresi." });
  }

  return res.json({
    timestamp: Date.now(),
    status: "online",
    activeKeys: process.env.GEMINI_API_KEY ? 1 : 0,
    env: process.env.NODE_ENV || "production",
  });
});

// Catch-all 404 for unknown API endpoints
app.use("/api/*", (_req: Request, res: Response) => {
  res.status(404).json({ error: "API Rotaları aktif, ancak istenen rotaya ulaşılamadı." });
});

export default function handler(req: any, res: any) {
  return app(req, res);
}
