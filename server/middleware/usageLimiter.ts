import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/index";
import { getUserSubscriptionFromDb } from "../services/paymentService";
import { tryConsume, refund } from "../services/usageService";
import { AiFeature } from "../types/subscription";

const FEATURE_LABELS: Record<AiFeature, string> = {
  categorize: "günlük AI etiketleme",
  chat: "günlük AI asistan",
  mindmap: "aylık zihin haritası",
  ideas: "aylık fikir üretimi",
};

/**
 * Enforces plan quotas for AI features. Users who bring their own Gemini key (BYOK) are not metered.
 */
export function checkAiUsageLimit(feature: AiFeature) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (req.headers["x-gemini-api-key"]) return next();

      const userId = req.user!.uid;
      const subscription = await getUserSubscriptionFromDb(userId);
      const result = await tryConsume(userId, subscription.plan, feature);

      if (!result.allowed) {
        return res.status(429).json({
          error: `${FEATURE_LABELS[feature]} hakkın doldu (${result.used}/${result.limit}). Pro pakete geçerek limitini artırabilir veya Ayarlar'dan kendi Gemini anahtarını ekleyebilirsin.`,
          requiresUpgrade: true,
          feature,
          used: result.used,
          limit: result.limit,
        });
      }
      // Failed AI calls should not cost the user quota
      res.on("finish", () => {
        if (res.statusCode >= 500) refund(userId, feature).catch(() => {});
      });
      res.setHeader("X-Usage-Remaining", result.limit === -1 ? "unlimited" : String(result.limit - result.used));
      next();
    } catch (err) {
      next(err);
    }
  };
}
