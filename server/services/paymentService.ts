import crypto from "crypto";
import { firebaseAdminApp } from "../config/firebase.js";
import { PlanType, UserSubscription, PLAN_LIMITS } from "../types/subscription.js";

// Prices in TRY (Turkish Lira)
export const PRICING_CONFIG = {
  pro: {
    monthlyPrice: 99,
    yearlyPrice: 950,
    name: "Pro Paket",
    shopierProductCode: process.env.SHOPIER_PRO_PRODUCT_ID || "101",
  },
  premium: {
    monthlyPrice: 249,
    yearlyPrice: 2390,
    name: "Premium Paket",
    shopierProductCode: process.env.SHOPIER_PREMIUM_PRODUCT_ID || "102",
  },
};

/**
 * Generate Shopier payment form HTML or direct URL for a given user & plan
 */
export function createShopierCheckoutSession(params: {
  userId: string;
  userEmail: string;
  plan: PlanType;
  billingPeriod: "monthly" | "yearly";
}) {
  const { userId, userEmail, plan, billingPeriod } = params;
  const config = PRICING_CONFIG[plan === "premium" ? "premium" : "pro"];
  const amount = billingPeriod === "yearly" ? config.yearlyPrice : config.monthlyPrice;
  const platformOrderId = `NM-${plan.toUpperCase()}-${userId.substring(0, 8)}-${Date.now()}`;

  const apiKey = process.env.SHOPIER_API_KEY || "";
  const apiSecret = process.env.SHOPIER_API_SECRET || "";

  // If Shopier credentials are not set, return simulated payment link for testing
  if (!apiKey || !apiSecret) {
    return {
      provider: "shopier",
      isTestMode: true,
      checkoutUrl: `/api/subscription/test-checkout?orderId=${platformOrderId}&plan=${plan}&userId=${userId}`,
      platformOrderId,
      amount,
      currency: "TRY"
    };
  }

  // Shopier HTML Form payload generation
  const payloadData = {
    API_key: apiKey,
    website_index: 1,
    platform_order_id: platformOrderId,
    product_name: `NovaMind ${config.name} (${billingPeriod === "yearly" ? "Yıllık" : "Aylık"})`,
    product_type: 1,
    buyer_name: userEmail.split("@")[0] || "Kullanici",
    buyer_surname: "NovaMind",
    buyer_email: userEmail,
    buyer_phone: "05555555555",
    billing_address: "İstanbul",
    billing_city: "İstanbul",
    billing_country: "Türkiye",
    billing_postcode: "34000",
    shipping_address: "İstanbul",
    shipping_city: "İstanbul",
    shipping_country: "Türkiye",
    shipping_postcode: "34000",
    total_order_value: amount.toFixed(2),
    currency: 0, // 0 = TRY
  };

  const signatureData = `${payloadData.random_nr || ""}${platformOrderId}${payloadData.total_order_value}${apiSecret}`;
  const signature = crypto.createHash("sha256").update(signatureData).digest("base64");

  return {
    provider: "shopier",
    isTestMode: false,
    checkoutUrl: "https://www.shopier.com/ShowProduct/api_pay.php",
    platformOrderId,
    amount,
    currency: "TRY",
    formData: {
      ...payloadData,
      signature
    }
  };
}

/**
 * Verify Shopier Webhook Signature
 */
export function verifyShopierWebhookSignature(body: Record<string, any>): boolean {
  const apiSecret = process.env.SHOPIER_API_SECRET;
  if (!apiSecret) return true; // In dev mode without secret, accept webhook

  const { random_nr, platform_order_id, total_order_value, signature } = body;
  if (!random_nr || !platform_order_id || !total_order_value || !signature) return false;

  const expectedSignature = crypto
    .createHash("sha256")
    .update(`${random_nr}${platform_order_id}${total_order_value}${apiSecret}`)
    .digest("base64");

  return signature === expectedSignature;
}

/**
 * Activate or update user subscription in Firestore
 */
export async function updateUserSubscriptionInDb(params: {
  userId: string;
  plan: PlanType;
  durationDays?: number;
  paymentProvider: "shopier" | "iyzico" | "manual";
  orderId?: string;
  customerEmail?: string;
}): Promise<UserSubscription> {
  const { userId, plan, durationDays = 30, paymentProvider, orderId, customerEmail } = params;
  const now = Date.now();
  const expiresAt = now + durationDays * 24 * 60 * 60 * 1000;

  const subscription: UserSubscription = {
    userId,
    plan,
    status: "active",
    startsAt: now,
    expiresAt,
    paymentProvider,
    orderId,
    customerEmail
  };

  if (firebaseAdminApp) {
    const db = firebaseAdminApp.firestore();
    await db.collection("users").doc(userId).collection("subscription").doc("current").set(subscription, { merge: true });
    await db.collection("users").doc(userId).set({
      plan,
      isPremium: plan !== "free",
      updatedAt: now
    }, { merge: true });
  }

  return subscription;
}

/**
 * Fetch current user subscription from Firestore
 */
export async function getUserSubscriptionFromDb(userId: string): Promise<UserSubscription> {
  const defaultFreeSub: UserSubscription = {
    userId,
    plan: "free",
    status: "active",
    startsAt: Date.now(),
    expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
    paymentProvider: "manual"
  };

  if (!firebaseAdminApp) return defaultFreeSub;

  try {
    const db = firebaseAdminApp.firestore();
    const doc = await db.collection("users").doc(userId).collection("subscription").doc("current").get();

    if (doc.exists) {
      const data = doc.data() as UserSubscription;
      // Check expiration
      if (data.expiresAt && data.expiresAt < Date.now() && data.plan !== "free") {
        data.plan = "free";
        data.status = "expired";
      }
      return data;
    }
  } catch (e) {
    console.warn("Firestore subscription fetch fallback:", e);
  }

  return defaultFreeSub;
}
