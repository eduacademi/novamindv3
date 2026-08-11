import { Router } from "express";
import { requireAuth, optionalAuth } from "../middleware/auth";
import { syncCardToGraph, syncAllCardsToGraph, deleteCardFromGraph, getUserGraph } from "../services/graphService";
import { AuthenticatedRequest } from "../types/index";

const router = Router();

// GET /api/graph - Fetch Knowledge Graph for current user from Neo4j
router.get("/graph", optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.uid || "dev-anonymous-user";
    const graphData = await getUserGraph(userId);

    if (!graphData) {
      return res.json({
        available: false,
        message: "Neo4j veritabanı aktif değil veya veri bulunamadı. Fallback görünümü kullanılıyor.",
        nodes: [],
        links: []
      });
    }

    return res.json({
      available: true,
      ...graphData
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/graph/sync - Sync a card or multiple cards into Neo4j
router.post("/graph/sync", optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.uid || "dev-anonymous-user";
    const { card, cards } = req.body;

    if (cards && Array.isArray(cards)) {
      const success = await syncAllCardsToGraph(userId, cards);
      return res.json({ success, count: cards.length });
    }

    if (card) {
      const success = await syncCardToGraph(userId, card);
      return res.json({ success });
    }

    return res.status(400).json({ error: "Senkronize edilecek card veya cards verisi gerekli." });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/graph/card/:id - Delete a card from Neo4j
router.delete("/graph/card/:id", optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.uid || "dev-anonymous-user";
    const cardId = req.params.id;

    if (!cardId) {
      return res.status(400).json({ error: "Kart ID belirtilmelidir." });
    }

    const success = await deleteCardFromGraph(userId, cardId);
    return res.json({ success });
  } catch (err) {
    next(err);
  }
});

export default router;
