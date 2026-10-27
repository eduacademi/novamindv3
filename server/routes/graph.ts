import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { syncCardToGraph, syncAllCardsToGraph, deleteCardFromGraph, getUserGraph } from "../services/graphService";
import { AuthenticatedRequest } from "../types/index";

const router = Router();

router.get("/graph", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const graphData = await getUserGraph(req.user!.uid);
    if (!graphData) {
      return res.json({ available: false, nodes: [], links: [] });
    }
    return res.json({ available: true, ...graphData });
  } catch (err) {
    next(err);
  }
});

router.post("/graph/sync", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.uid;
    const { card, cards } = req.body || {};

    if (Array.isArray(cards)) {
      const success = await syncAllCardsToGraph(userId, cards.slice(0, 2000));
      return res.json({ success, count: cards.length });
    }
    if (card) {
      return res.json({ success: await syncCardToGraph(userId, card) });
    }
    return res.status(400).json({ error: "Senkronize edilecek card veya cards verisi gerekli." });
  } catch (err) {
    next(err);
  }
});

router.delete("/graph/card/:id", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    return res.json({ success: await deleteCardFromGraph(req.user!.uid, req.params.id) });
  } catch (err) {
    next(err);
  }
});

export default router;
