import { firestoreDb } from "../config/firebase";
import { AiFeature, PLAN_LIMITS, PlanType, UserUsageStats } from "../types/subscription";

const memoryUsage = new Map<string, UserUsageStats>();

function periodKeys() {
  const iso = new Date().toISOString();
  return { day: iso.slice(0, 10), month: iso.slice(0, 7) };
}

function normalize(raw: Partial<UserUsageStats> | undefined): UserUsageStats {
  const { day, month } = periodKeys();
  const base: UserUsageStats = { day, month, categorize: 0, chat: 0, mindmap: 0, ideas: 0 };
  if (!raw) return base;
  return {
    day,
    month,
    // Daily counters reset when the day changes, monthly counters when the month changes
    categorize: raw.day === day ? raw.categorize || 0 : 0,
    chat: raw.day === day ? raw.chat || 0 : 0,
    mindmap: raw.month === month ? raw.mindmap || 0 : 0,
    ideas: raw.month === month ? raw.ideas || 0 : 0,
  };
}

export function limitFor(plan: PlanType, feature: AiFeature): number {
  const l = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
  switch (feature) {
    case "categorize": return l.maxDailyAiCategorize;
    case "chat": return l.maxDailyChat;
    case "mindmap": return l.maxMonthlyMindmaps;
    case "ideas": return l.maxMonthlyIdeas;
  }
}

export async function getUsage(userId: string): Promise<UserUsageStats> {
  if (firestoreDb) {
    try {
      const snap = await firestoreDb.collection("users").doc(userId).collection("usage").doc("current").get();
      return normalize(snap.exists ? (snap.data() as UserUsageStats) : undefined);
    } catch (e) {
      console.warn("Usage read fallback to memory:", e);
    }
  }
  return normalize(memoryUsage.get(userId));
}

/**
 * Atomically checks the quota and increments the counter.
 * Returns false (and does not increment) when the user is over the limit.
 */
export async function tryConsume(userId: string, plan: PlanType, feature: AiFeature): Promise<{ allowed: boolean; used: number; limit: number }> {
  const limit = limitFor(plan, feature);

  if (firestoreDb) {
    try {
      const ref = firestoreDb.collection("users").doc(userId).collection("usage").doc("current");
      return await firestoreDb.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        const usage = normalize(snap.exists ? (snap.data() as UserUsageStats) : undefined);
        if (limit !== -1 && usage[feature] >= limit) return { allowed: false, used: usage[feature], limit };
        usage[feature] += 1;
        tx.set(ref, usage);
        return { allowed: true, used: usage[feature], limit };
      });
    } catch (e) {
      console.warn("Usage transaction fallback to memory:", e);
    }
  }

  const usage = normalize(memoryUsage.get(userId));
  if (limit !== -1 && usage[feature] >= limit) return { allowed: false, used: usage[feature], limit };
  usage[feature] += 1;
  memoryUsage.set(userId, usage);
  return { allowed: true, used: usage[feature], limit };
}

/** Gives a consumed unit back (used when the AI call itself failed). */
export async function refund(userId: string, feature: AiFeature): Promise<void> {
  if (firestoreDb) {
    try {
      const ref = firestoreDb.collection("users").doc(userId).collection("usage").doc("current");
      await firestoreDb.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        const usage = normalize(snap.exists ? (snap.data() as UserUsageStats) : undefined);
        usage[feature] = Math.max(0, usage[feature] - 1);
        tx.set(ref, usage);
      });
      return;
    } catch (e) {
      console.warn("Usage refund fallback to memory:", e);
    }
  }
  const usage = normalize(memoryUsage.get(userId));
  usage[feature] = Math.max(0, usage[feature] - 1);
  memoryUsage.set(userId, usage);
}
