import { Router } from "express";
import { fetchSingleMetadata, inferCategoryAndTags } from "../services/scraperService";
import { batchCategorizeWithGemini, isAiConfigured } from "../services/geminiService";
import { metadataLimiter } from "../middleware/rateLimit";
import { requireAuth } from "../middleware/auth";
import { AuthenticatedRequest } from "../types/index";
import { getUserSubscriptionFromDb } from "../services/paymentService";
import { tryConsume } from "../services/usageService";

const router = Router();

router.post("/metadata", requireAuth, metadataLimiter, async (req, res, next) => {
  try {
    const { url } = req.body || {};
    if (!url || typeof url !== "string" || url.length > 2048) {
      return res.status(400).json({ error: "Geçerli bir URL gerekli." });
    }
    const metadata = await fetchSingleMetadata(url);
    const heur = inferCategoryAndTags(metadata.url, metadata.title, metadata.description, metadata.platform);
    return res.json({ ...metadata, category: heur.category, tags: heur.tags });
  } catch (err) {
    next(err);
  }
});

// Bulk add: scrape up to 30 links, then AI-categorize them if the user still has quota
router.post("/batch-metadata", requireAuth, metadataLimiter, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { urls } = req.body || {};
    if (!Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: "En az bir URL gerekli." });
    }

    const targetUrls = urls.filter((u): u is string => typeof u === "string" && u.length <= 2048).slice(0, 30);
    const settled = await Promise.allSettled(targetUrls.map((u) => fetchSingleMetadata(u)));
    const rawItems = settled
      .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof fetchSingleMetadata>>> => r.status === "fulfilled")
      .map((r) => r.value);

    let useAi = !!req.headers["x-gemini-api-key"];
    if (!useAi && isAiConfigured(req) && rawItems.length > 0) {
      const sub = await getUserSubscriptionFromDb(req.user!.uid);
      useAi = (await tryConsume(req.user!.uid, sub.plan, "categorize")).allowed;
    }

    const items = useAi
      ? await batchCategorizeWithGemini(req, rawItems)
      : rawItems.map((item) => ({ ...item, ...inferCategoryAndTags(item.url, item.title, item.description, item.platform) }));

    return res.json({ items, skipped: targetUrls.length - rawItems.length });
  } catch (err) {
    next(err);
  }
});

export default router;
