export type PlanType = "free" | "pro" | "premium";

export interface PlanFeatureLimits {
  maxSavedCards: number; // e.g. 50 for free, 1000 for pro, -1 for unlimited
  maxDailyAiCategorize: number; // 10 free, 100 pro, -1 unlimited
  maxMonthlyMindmaps: number; // 3 free, 30 pro, -1 unlimited
  maxMonthlyIdeas: number; // 3 free, 30 pro, -1 unlimited
  hasServerAiKey: boolean; // false for free (use BYOK), true for pro/premium
  hasChromeExtension: boolean;
  hasWeeklyDigest: boolean;
}

export const PLAN_LIMITS: Record<PlanType, PlanFeatureLimits> = {
  free: {
    maxSavedCards: 50,
    maxDailyAiCategorize: 10,
    maxMonthlyMindmaps: 3,
    maxMonthlyIdeas: 3,
    hasServerAiKey: false, // free users use BYOK (own key) or limited fallback
    hasChromeExtension: false,
    hasWeeklyDigest: false,
  },
  pro: {
    maxSavedCards: 1000,
    maxDailyAiCategorize: 100,
    maxMonthlyMindmaps: 30,
    maxMonthlyIdeas: 30,
    hasServerAiKey: true,
    hasChromeExtension: true,
    hasWeeklyDigest: true,
  },
  premium: {
    maxSavedCards: -1,
    maxDailyAiCategorize: -1,
    maxMonthlyMindmaps: -1,
    maxMonthlyIdeas: -1,
    hasServerAiKey: true,
    hasChromeExtension: true,
    hasWeeklyDigest: true,
  },
};

export interface UserSubscription {
  userId: string;
  plan: PlanType;
  status: "active" | "cancelled" | "expired";
  startsAt: number;
  expiresAt: number;
  paymentProvider: "shopier" | "iyzico" | "manual";
  orderId?: string;
  customerEmail?: string;
}

export interface UserUsageStats {
  userId: string;
  savedCardsCount: number;
  dailyAiCategorizeCount: number;
  monthlyMindmapsCount: number;
  monthlyIdeasCount: number;
  lastResetDate: string; // YYYY-MM-DD
}
