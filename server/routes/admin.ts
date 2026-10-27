import { Router, Request, Response, NextFunction } from "express";
import { apiKeyRouter } from "../services/apiKeyRouter";
import { PRICING_CONFIG } from "../services/paymentService";
import { getNeo4jDriver } from "../config/neo4j";
import { GoogleGenAI } from "@google/genai";
import crypto from "crypto";
import rateLimit from "express-rate-limit";
import { isShopierConfigured } from "../services/paymentService";
import { GEMINI_MODEL } from "../services/geminiService";

const adminLoginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false, message: { error: "Çok fazla deneme. 15 dakika sonra tekrar deneyin." } });

const router = Router();

/**
 * Admin access requires ADMIN_SECRET_KEY (min. 16 chars) in the environment.
 * There is intentionally no built-in default password.
 */
const isValidSecret = (inputSecret: unknown): boolean => {
  const envSecret = (process.env.ADMIN_SECRET_KEY || "").trim();
  const input = typeof inputSecret === "string" ? inputSecret.trim() : "";
  if (envSecret.length < 16 || !input) return false;
  const a = crypto.createHash("sha256").update(input).digest();
  const b = crypto.createHash("sha256").update(envSecret).digest();
  return crypto.timingSafeEqual(a, b);
};

function checkAdminAuth(req: Request, res: Response, next: NextFunction) {
  if (!isValidSecret(req.headers["x-admin-secret"])) {
    return res.status(401).json({ error: "Yetkisiz erişim." });
  }
  next();
}

router.post("/admin/login", adminLoginLimiter, (req, res) => {
  if (!(process.env.ADMIN_SECRET_KEY || "").trim()) {
    return res.status(503).json({ error: "Admin paneli kapalı: sunucuda ADMIN_SECRET_KEY tanımlı değil." });
  }
  if (isValidSecret(req.body?.secret)) {
    return res.json({ success: true });
  }
  return res.status(401).json({ error: "Geçersiz admin şifresi." });
});

// GET /api/admin/metrics - Overall SaaS Stats & Key Router Metrics
router.get("/admin/metrics", checkAdminAuth, async (req, res) => {
  const routerMetrics = apiKeyRouter.getMetrics();
  const neo4jDriver = getNeo4jDriver();

  return res.json({
    timestamp: Date.now(),
    router: routerMetrics,
    neo4j: {
      active: !!neo4jDriver,
      configured: !!process.env.NEO4J_URI,
    },
    payment: {
      shopierConfigured: isShopierConfigured(),
      firestoreConfigured: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
      model: GEMINI_MODEL,
      pricingConfig: PRICING_CONFIG,
    },
  });
});

// GET /api/admin/keys - Fetch all API keys in pool
router.get("/admin/keys", checkAdminAuth, (req, res) => {
  const keys = apiKeyRouter.getKeysPool();
  const metrics = apiKeyRouter.getMetrics();
  return res.json({ keys, metrics });
});

// POST /api/admin/keys - Add a new API Key into pool
router.post("/admin/keys", checkAdminAuth, (req, res) => {
  const { key, label, isFree } = req.body;
  if (!key || typeof key !== "string" || key.trim().length < 10) {
    return res.status(400).json({ error: "Geçerli bir API Key zorunludur." });
  }

  const newKey = apiKeyRouter.addKey({
    key: key.trim(),
    label: label || `Free Key #${Date.now().toString().slice(-4)}`,
    isFree: isFree !== false,
  });

  return res.json({ success: true, key: newKey });
});

// DELETE /api/admin/keys/:id - Remove key from pool
router.delete("/admin/keys/:id", checkAdminAuth, (req, res) => {
  const { id } = req.params;
  const removed = apiKeyRouter.removeKey(id);
  if (removed) {
    return res.json({ success: true, message: "API Key havuzdan silindi." });
  }
  return res.status(404).json({ error: "API Key bulunamadı." });
});

// POST /api/admin/keys/:id/toggle - Enable or disable key
router.post("/admin/keys/:id/toggle", checkAdminAuth, (req, res) => {
  const { id } = req.params;
  const toggled = apiKeyRouter.toggleKeyActive(id);
  if (toggled) {
    return res.json({ success: true, message: "API Key durumu güncellendi." });
  }
  return res.status(404).json({ error: "API Key bulunamadı." });
});

// POST /api/admin/keys/test - Test an API key with lightweight call
router.post("/admin/keys/test", checkAdminAuth, async (req, res) => {
  const { key } = req.body;
  const targetKey = key || apiKeyRouter.getNextApiKey();

  if (!targetKey) {
    return res.status(400).json({ error: "Test edilecek API Key bulunamadı." });
  }

  try {
    const aiClient = new GoogleGenAI({
      apiKey: targetKey,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } },
    });

    const response = await aiClient.models.generateContent({
      model: GEMINI_MODEL,
      contents: "Say Hello in one word.",
    });

    return res.json({
      success: true,
      message: "API Key başarıyla doğrulandı!",
      response: response.text?.trim() || "OK",
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: err.message || "API Key testi başarısız oldu.",
    });
  }
});

export default router;
