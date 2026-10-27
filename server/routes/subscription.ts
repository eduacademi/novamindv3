import { Router } from "express";
import express from "express";
import { requireAuth } from "../middleware/auth";
import { AuthenticatedRequest } from "../types/index";
import {
  createShopierCheckoutSession,
  verifyShopierWebhookSignature,
  updateUserSubscriptionInDb,
  getUserSubscriptionFromDb,
  isShopierConfigured,
  parseOrderId,
  PRICING_CONFIG,
} from "../services/paymentService";
import { getUsage } from "../services/usageService";
import { PLAN_LIMITS, PlanType } from "../types/subscription";

const router = Router();

// Subscription status, plan limits and current usage
router.get("/subscription/status", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.uid;
    const [subscription, usage] = await Promise.all([getUserSubscriptionFromDb(userId), getUsage(userId)]);
    return res.json({
      subscription,
      limits: PLAN_LIMITS[subscription.plan] || PLAN_LIMITS.free,
      usage,
      pricing: PRICING_CONFIG,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/subscription/create-checkout", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (req.user!.isAnonymous || !req.user!.email) {
      return res.status(403).json({ error: "Satın alma için önce e-posta veya Google ile giriş yapmalısın.", requiresLogin: true });
    }
    const { plan, billingPeriod = "monthly" } = req.body || {};
    if (!["pro", "premium"].includes(plan)) {
      return res.status(400).json({ error: "Geçerli bir paket seçin ('pro' veya 'premium')." });
    }

    const session = createShopierCheckoutSession({
      userId: req.user!.uid,
      userEmail: req.user!.email,
      plan: plan as PlanType,
      billingPeriod: billingPeriod === "yearly" ? "yearly" : "monthly",
    });
    return res.json(session);
  } catch (err) {
    next(err);
  }
});

// Shopier posts application/x-www-form-urlencoded callbacks
router.post("/subscription/webhook/shopier", express.urlencoded({ extended: false }), async (req, res, next) => {
  try {
    if (!verifyShopierWebhookSignature(req.body)) {
      console.warn("Shopier webhook rejected: invalid signature");
      return res.status(400).send("Invalid signature");
    }

    const { status, platform_order_id, buyer_email } = req.body;
    const order = parseOrderId(platform_order_id);

    if (String(status).toLowerCase() === "success" && order) {
      await updateUserSubscriptionInDb({
        userId: order.userId,
        plan: order.plan,
        billingPeriod: order.period,
        paymentProvider: "shopier",
        orderId: platform_order_id,
        customerEmail: buyer_email,
      });
      console.log(`✅ Shopier payment: ${platform_order_id}`);
    }
    return res.status(200).send("OK");
  } catch (err) {
    next(err);
  }
});

// Local payment simulation: only when Shopier is not configured and not in production
router.get("/subscription/test-checkout", async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === "production" || isShopierConfigured()) {
      return res.status(403).send("Test ödemesi bu ortamda kapalı.");
    }
    const order = parseOrderId(String(req.query.orderId || ""));
    if (!order) return res.status(400).send("Geçersiz sipariş numarası.");

    await updateUserSubscriptionInDb({
      userId: order.userId,
      plan: order.plan,
      billingPeriod: order.period,
      paymentProvider: "manual",
      orderId: String(req.query.orderId),
    });
    return res.redirect(`/?payment=success&plan=${order.plan}`);
  } catch (err) {
    next(err);
  }
});

export default router;
