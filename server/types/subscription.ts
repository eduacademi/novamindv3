export type PlanType = "free" | "pro" | "premium";
export type BillingPeriod = "monthly" | "yearly";
export type AiFeature = "categorize" | "mindmap" | "ideas" | "chat";

export interface PlanFeatureLimits {
  maxSavedCards: number; // -1 = unlimited
  maxDailyAiCategorize: number;
  maxDailyChat: number;
  maxMonthlyMindmaps: number;
  maxMonthlyIdeas: number;
  hasServerAiKey: boolean;
  hasChromeExtension: boolean;
  hasWeeklyDigest: boolean;
}

export const PLAN_LIMITS: Record<PlanType, PlanFeatureLimits> = {
  free: {
    maxSavedCards: 50,
    maxDailyAiCategorize: 10,
    maxDailyChat: 10,
    maxMonthlyMindmaps: 3,
    maxMonthlyIdeas: 3,
    hasServerAiKey: true,
    hasChromeExtension: true,
    hasWeeklyDigest: false,
  },
  pro: {
    maxSavedCards: 1000,
    maxDailyAiCategorize: 100,
    maxDailyChat: 100,
    maxMonthlyMindmaps: 30,
    maxMonthlyIdeas: 30,
    hasServerAiKey: true,
    hasChromeExtension: true,
    hasWeeklyDigest: true,
  },
  premium: {
    maxSavedCards: -1,
    maxDailyAiCategorize: -1,
    maxDailyChat: -1,
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
  billingPeriod?: BillingPeriod;
  paymentProvider: "shopier" | "iyzico" | "manual";
  orderId?: string;
  processedOrderIds?: string[];
  customerEmail?: string;
}

export interface UserUsageStats {
  day: string; // YYYY-MM-DD
  month: string; // YYYY-MM
  categorize: number;
  chat: number;
  mindmap: number;
  ideas: number;
}
