import { Router } from "express";
import { requireAuth, optionalAuth } from "../middleware/auth";
import { AuthenticatedRequest } from "../types/index";
import { 
  createShopierCheckoutSession, 
  verifyShopierWebhookSignature, 
  updateUserSubscriptionInDb, 
  getUserSubscriptionFromDb, 
  PRICING_CONFIG 
} from "../services/paymentService";
import { PLAN_LIMITS, PlanType } from "../types/subscription";

const router = Router();

// 1. Fetch Subscription Status & Feature Limits
router.get("/subscription/status", optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.uid || "dev-anonymous-user";
    const subscription = await getUserSubscriptionFromDb(userId);
    const limits = PLAN_LIMITS[subscription.plan || "free"];

    return res.json({
      subscription,
      limits,
      pricing: PRICING_CONFIG
    });
  } catch (err) {
    next(err);
  }
});

// 2. Create Shopier Checkout Link
router.post("/subscription/create-checkout", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.uid || "dev-anonymous-user";
    const userEmail = req.user?.email || "user@novamind.app";
    const { plan, billingPeriod = "monthly" } = req.body;

    if (!plan || !["pro", "premium"].includes(plan)) {
      return res.status(400).json({ error: "Geçerli bir paket seçin ('pro' veya 'premium')." });
    }

    const session = createShopierCheckoutSession({
      userId,
      userEmail,
      plan: plan as PlanType,
      billingPeriod: billingPeriod === "yearly" ? "yearly" : "monthly"
    });

    return res.json(session);
  } catch (err) {
    next(err);
  }
});

// 3. Shopier Webhook Handler (Receives Payment Confirmation)
router.post("/subscription/webhook/shopier", async (req, res, next) => {
  try {
    const isValid = verifyShopierWebhookSignature(req.body);
    if (!isValid) {
      return res.status(400).send("Invalid Webhook Signature");
    }

    const { status, platform_order_id, buyer_email } = req.body;

    // Status 'success' in Shopier webhook
    if (status === "success" || status === "1") {
      // OrderId format: NM_PLAN_fullUserId_timestamp
      const parts = (platform_order_id || "").split("_");
      const plan = (parts[1] || "PRO").toLowerCase() as PlanType;
      const fullUserId = parts[2] || "";

      console.log(`✅ Payment received via Shopier for order ${platform_order_id}, plan: ${plan}`);

      if (fullUserId) {
        await updateUserSubscriptionInDb({
          userId: fullUserId,
          plan: ["pro", "premium"].includes(plan) ? plan : "pro",
          paymentProvider: "shopier",
          orderId: platform_order_id,
          customerEmail: buyer_email
        });
      }
    }

    return res.status(200).send("OK");
  } catch (err) {
    next(err);
  }
});

// 4. Test Checkout Route (Development Payment Simulation)
router.get("/subscription/test-checkout", async (req, res) => {
  if (process.env.NODE_ENV === "production" && !process.env.ALLOW_TEST_CHECKOUT) {
    return res.status(403).send("Test checkout is disabled in production.");
  }

  const { orderId, plan, userId } = req.query;

  if (!userId || !plan) {
    return res.status(400).send("Eksik parametreler.");
  }

  // Activate plan immediately in test mode
  await updateUserSubscriptionInDb({
    userId: String(userId),
    plan: (String(plan) === "premium" ? "premium" : "pro") as PlanType,
    paymentProvider: "shopier",
    orderId: String(orderId || `TEST-${Date.now()}`),
    customerEmail: "test@novamind.app"
  });

  return res.send(`
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8" />
      <title>Ödeme Başarılı - NovaMind</title>
      <style>
        body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #0f172a; color: white; margin: 0; }
        .card { background: #1e293b; padding: 2rem; border-radius: 1.5rem; border: 1px solid #334155; text-align: center; max-width: 400px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
        .icon { font-size: 3rem; margin-bottom: 1rem; }
        h1 { font-size: 1.5rem; margin-bottom: 0.5rem; color: #10b981; }
        p { color: #94a3b8; font-size: 0.9rem; margin-bottom: 1.5rem; }
        a { background: #6366f1; color: white; text-decoration: none; padding: 0.75rem 1.5rem; border-radius: 0.75rem; font-weight: bold; display: inline-block; }
        a:hover { background: #4f46e5; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="icon">🎉</div>
        <h1>Ödemeniz Başarıyla Alındı!</h1>
        <p>NovaMind <strong>${String(plan).toUpperCase()}</strong> paketiniz hesabınıza tanımlandı. Artık tüm gelişmiş özelliklerin tadını çıkarabilirsiniz.</p>
        <a href="/">Uygulamaya Dön</a>
      </div>
    </body>
    </html>
  `);
});

export default router;
