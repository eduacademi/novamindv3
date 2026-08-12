import { Router } from "express";
import { fetchSingleMetadata, inferCategoryAndTags } from "../services/scraperService";
import { batchCategorizeWithGemini } from "../services/geminiService";
import { metadataLimiter } from "../middleware/rateLimit";

const router = Router();

// Single Metadata Extraction Route
router.post("/metadata", metadataLimiter, async (req, res, next) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "URL parametresi gerekli." });
    }

    const metadata = await fetchSingleMetadata(url);
    const heur = inferCategoryAndTags(metadata.url, metadata.title, metadata.description, metadata.platform);

    return res.json({
      ...metadata,
      category: heur.category,
      tags: heur.tags
    });

  } catch (err) {
    next(err);
  }
});

// Batch Metadata Extraction Route for Bulk Adding
router.post("/batch-metadata", metadataLimiter, async (req, res, next) => {
  try {
    const { urls } = req.body;
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: "En az bir URL gerekli." });
    }

    const targetUrls = urls.slice(0, 30);
    const rawItems = await Promise.all(targetUrls.map((u: string) => fetchSingleMetadata(u)));

    const categorizedItems = await batchCategorizeWithGemini(req, rawItems);

    return res.json({ items: categorizedItems });
  } catch (err) {
    next(err);
  }
});

export default router;
