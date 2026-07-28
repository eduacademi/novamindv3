import { Router } from "express";
import { ExtensionQueueItem } from "../types/index.js";

const router = Router();

// In-memory extension queue (will be upgraded to Redis/Firestore in future phase)
const extensionQueue: ExtensionQueueItem[] = [];

router.post("/extension/save", (req, res) => {
  const { url, title, description, note, platform, thumbnail_url, author } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required" });
  
  const newItem: ExtensionQueueItem = {
    id: `card-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    url,
    title: title || null,
    description: description || null,
    thumbnail_url: thumbnail_url || null,
    author: author || null,
    platform: platform || "other",
    note: note || "",
    tags: [],
    category: null,
    metadata_source: "manual",
    created_at: Date.now()
  };
  
  extensionQueue.push(newItem);
  return res.json({ success: true, item: newItem });
});

router.get("/extension/pop", (req, res) => {
  const items = [...extensionQueue];
  extensionQueue.length = 0; // clear queue
  return res.json({ items });
});

export default router;
