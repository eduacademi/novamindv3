import { Router } from "express";
import { 
  categorizeSingleItemWithGemini, 
  batchCategorizeWithGemini, 
  generateMindmapWithGemini, 
  generateIdeasWithGemini,
  chatWithBookmarks
} from "../services/geminiService.js";
import { aiLimiter } from "../middleware/rateLimit.js";

const router = Router();

// AI Auto Categorization & Tagging
router.post("/gemini/categorize", aiLimiter, async (req, res, next) => {
  try {
    const { items, title, description, note, url, platform } = req.body;

    if (!process.env.GEMINI_API_KEY && !req.headers["x-gemini-api-key"]) {
      return res.status(500).json({ error: "GEMINI_API_KEY çevre değişkeni tanımlanmamış." });
    }

    if (items && Array.isArray(items) && items.length > 0) {
      const categorized = await batchCategorizeWithGemini(req, items);
      return res.json({ items: categorized });
    }

    const result = await categorizeSingleItemWithGemini(req, { title, description, note, url, platform });
    return res.json(result);

  } catch (err) {
    next(err);
  }
});

// AI Mind Map / Knowledge Graph Generator
router.post("/gemini/mindmap", aiLimiter, async (req, res, next) => {
  try {
    const { cards } = req.body;

    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      return res.status(400).json({ error: "Anlamlı mindmap oluşturmak için en az 1 kart gereklidir." });
    }

    if (!process.env.GEMINI_API_KEY && !req.headers["x-gemini-api-key"]) {
      return res.status(500).json({ error: "GEMINI_API_KEY bulunamadı." });
    }

    const mindmapRoot = await generateMindmapWithGemini(req, cards);

    return res.json({
      root: mindmapRoot,
      generated_at: Date.now(),
      total_cards_analyzed: cards.length
    });

  } catch (err) {
    next(err);
  }
});

// AI Creative Idea Generator ("Fikir Üretici")
router.post("/gemini/ideas", aiLimiter, async (req, res, next) => {
  try {
    const { mode, cards, selectedCardIds, customPrompt } = req.body;

    if (!process.env.GEMINI_API_KEY && !req.headers["x-gemini-api-key"]) {
      return res.status(500).json({ error: "GEMINI_API_KEY bulunamadı." });
    }

    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      return res.status(400).json({ error: "Fikir üretimi için kayıtlı kart bulunamadı." });
    }

    const ideas = await generateIdeasWithGemini(req, { mode, cards, selectedCardIds, customPrompt });
    return res.json({ ideas });

  } catch (err) {
    next(err);
  }
});

// AI Chat with Bookmarks (RAG)
router.post("/gemini/chat", aiLimiter, async (req, res, next) => {
  try {
    const { query, cards } = req.body;

    if (!process.env.GEMINI_API_KEY && !req.headers["x-gemini-api-key"]) {
      return res.status(500).json({ error: "GEMINI_API_KEY bulunamadı." });
    }

    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Soru (query) alanı gereklidir." });
    }

    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      return res.status(400).json({ error: "Sohbet edebilmek için kütüphanenizde en az 1 kart bulunmalıdır." });
    }

    const answer = await chatWithBookmarks(req, { query, cards });
    return res.json({ answer });

  } catch (err) {
    next(err);
  }
});

export default router;
