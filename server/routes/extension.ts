import { Router } from "express";
import { ExtensionQueueItem, AuthenticatedRequest } from "../types/index";
import { optionalAuth } from "../middleware/auth";
import { firebaseAdminApp } from "../config/firebase";
import { getFirestore } from "firebase-admin/firestore";

const router = Router();

// Per-user in-memory queue fallback
const userQueues = new Map<string, ExtensionQueueItem[]>();

router.post("/extension/save", optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.uid || req.body.userId || "dev-anonymous-user";
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
      metadata_source: "extension",
      created_at: Date.now()
    };
    
    let savedToDb = false;
    if (firebaseAdminApp) {
      try {
        const db = getFirestore(firebaseAdminApp);
        await db.collection("users").doc(userId).collection("pendingQueue").doc(newItem.id).set(newItem);
        savedToDb = true;
      } catch (e) {
        console.warn("Firestore extension save fallback to in-memory queue:", e);
      }
    }

    if (!savedToDb) {
      if (!userQueues.has(userId)) userQueues.set(userId, []);
      userQueues.get(userId)!.push(newItem);
    }

    return res.json({ success: true, item: newItem });
  } catch (err) {
    next(err);
  }
});

router.get("/extension/pop", optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.uid || req.query.userId as string || "dev-anonymous-user";
    let items: ExtensionQueueItem[] = [];
    let fetchedFromDb = false;

    if (firebaseAdminApp) {
      try {
        const db = getFirestore(firebaseAdminApp);
        const snapshot = await db.collection("users").doc(userId).collection("pendingQueue").get();
        items = snapshot.docs.map(doc => doc.data() as ExtensionQueueItem);

        // Delete popped items from Firestore
        const batch = db.batch();
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        if (items.length > 0) {
          await batch.commit();
        }
        fetchedFromDb = true;
      } catch (e) {
        console.warn("Firestore extension pop fallback to in-memory queue:", e);
      }
    }

    if (!fetchedFromDb) {
      items = [...(userQueues.get(userId) || [])];
      userQueues.set(userId, []);
    }

    return res.json({ items });
  } catch (err) {
    next(err);
  }
});

export default router;
