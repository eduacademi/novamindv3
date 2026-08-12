import { Router, Request, Response, NextFunction } from "express";
import { apiKeyRouter } from "../services/apiKeyRouter.js";
import { PRICING_CONFIG } from "../services/paymentService.js";
import { getNeo4jDriver } from "../config/neo4j.js";
import { GoogleGenAI } from "@google/genai";

const router = Router();
const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || "admin123";

// Simple Admin Authentication Middleware
function checkAdminAuth(req: Request, res: Response, next: NextFunction) {
  const secret = req.headers["x-admin-secret"] as string || req.body?.adminSecret || req.query?.adminSecret;
  if (secret !== ADMIN_SECRET) {
    return res.status(401).json({ error: "Yetkisiz erişim. Geçersiz Admin Şifresi." });
  }
  next();
}

// POST /api/admin/login - Verify Admin Secret
router.post("/admin/login", (req, res) => {
  const { secret } = req.body;
  if (secret === ADMIN_SECRET) {
    return res.json({ success: true, message: "Admin girişi başarılı." });
  }
  return res.status(401).json({ error: "Geçersiz Admin Şifresi." });
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
      uri: process.env.NEO4J_URI || "Bağlı değil",
    },
    payment: {
      shopierConfigured: !!(process.env.SHOPIER_API_KEY && process.env.SHOPIER_API_SECRET),
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
      model: "gemini-1.5-flash",
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
