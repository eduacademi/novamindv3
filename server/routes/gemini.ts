import { Router } from "express";
import {
  categorizeSingleItemWithGemini,
  batchCategorizeWithGemini,
  generateMindmapWithGemini,
  generateIdeasWithGemini,
  chatWithBookmarks,
  isAiConfigured,
} from "../services/geminiService";
import { aiLimiter } from "../middleware/rateLimit";
import { requireAuth } from "../middleware/auth";
import { checkAiUsageLimit } from "../middleware/usageLimiter";

const router = Router();

const NO_KEY_ERROR = "AI servisi şu an yapılandırılmamış. Ayarlar'dan kendi Gemini API anahtarını ekleyebilirsin.";

function hasCards(cards: unknown): cards is any[] {
  return Array.isArray(cards) && cards.length > 0;
}

router.post("/gemini/categorize", requireAuth, aiLimiter, (req, res, next) => {
  if (!isAiConfigured(req)) return res.status(503).json({ error: NO_KEY_ERROR });
  next();
}, checkAiUsageLimit("categorize"), async (req, res, next) => {
  try {
    const { items, title, description, note, url, platform } = req.body || {};
    if (Array.isArray(items) && items.length > 0) {
      return res.json({ items: await batchCategorizeWithGemini(req, items.slice(0, 30)) });
    }
    return res.json(await categorizeSingleItemWithGemini(req, { title, description, note, url, platform }));
  } catch (err) {
    next(err);
  }
});

router.post("/gemini/mindmap", requireAuth, aiLimiter, (req, res, next) => {
  if (!hasCards(req.body?.cards)) return res.status(400).json({ error: "Zihin haritası için en az 1 kart gerekli." });
  if (!isAiConfigured(req)) return res.status(503).json({ error: NO_KEY_ERROR });
  next();
}, checkAiUsageLimit("mindmap"), async (req, res, next) => {
  try {
    const { cards } = req.body;
    const root = await generateMindmapWithGemini(req, cards);
    return res.json({ root, generated_at: Date.now(), total_cards_analyzed: cards.length });
  } catch (err) {
    next(err);
  }
});

router.post("/gemini/ideas", requireAuth, aiLimiter, (req, res, next) => {
  if (!hasCards(req.body?.cards)) return res.status(400).json({ error: "Fikir üretimi için kayıtlı kart bulunamadı." });
  if (!isAiConfigured(req)) return res.status(503).json({ error: NO_KEY_ERROR });
  next();
}, checkAiUsageLimit("ideas"), async (req, res, next) => {
  try {
    const { mode, cards, selectedCardIds, customPrompt } = req.body;
    const ideas = await generateIdeasWithGemini(req, { mode, cards, selectedCardIds, customPrompt });
    return res.json({ ideas });
  } catch (err) {
    next(err);
  }
});

router.post("/gemini/chat", requireAuth, aiLimiter, (req, res, next) => {
  const { query, cards } = req.body || {};
  if (!query || typeof query !== "string" || query.length > 2000) {
    return res.status(400).json({ error: "Geçerli bir soru yazmalısın (en fazla 2000 karakter)." });
  }
  if (!hasCards(cards)) return res.status(400).json({ error: "Sohbet için kütüphanende en az 1 kart olmalı." });
  if (!isAiConfigured(req)) return res.status(503).json({ error: NO_KEY_ERROR });
  next();
}, checkAiUsageLimit("chat"), async (req, res, next) => {
  try {
    const answer = await chatWithBookmarks(req, { query: req.body.query, cards: req.body.cards });
    return res.json({ answer });
  } catch (err) {
    next(err);
  }
});

export default router;
