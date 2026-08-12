import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/index.js";
import { getUserSubscriptionFromDb } from "../services/paymentService.js";
import { PLAN_LIMITS } from "../types/subscription.js";

/**
 * Middleware that checks if user has remaining quota for AI operations based on their plan
 */
export function checkAiUsageLimit(feature: "categorize" | "mindmap" | "ideas") {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.uid || "dev-anonymous-user";
      const subscription = await getUserSubscriptionFromDb(userId);
      const limits = PLAN_LIMITS[subscription.plan || "free"];

      // If user provided custom Gemini API Key in header, bypass server limits (BYOK model)
      if (req.headers["x-gemini-api-key"]) {
        return next();
      }

      // Check specific feature limit
      if (feature === "mindmap" && limits.maxMonthlyMindmaps !== -1) {
        // Free user monthly limit check
        if (limits.maxMonthlyMindmaps <= 0) {
          return res.status(403).json({
            error: "Free paket limitine ulaştınız. Mind Map özelliğini sınırsız kullanmak için Pro pakete geçin veya Ayarlar'dan kendi Gemini API anahtarınızı tanımlayın.",
            requiresUpgrade: true
          });
        }
      }

      if (feature === "ideas" && limits.maxMonthlyIdeas !== -1) {
        if (limits.maxMonthlyIdeas <= 0) {
          return res.status(403).json({
            error: "Fikir Üretici kullanım sınırına ulaşıldı. Pro pakete geçerek sınırsız fikir sentezleyebilirsiniz.",
            requiresUpgrade: true
          });
        }
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
