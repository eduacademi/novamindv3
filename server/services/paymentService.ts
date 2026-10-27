import crypto from "crypto";
import { firestoreDb } from "../config/firebase";
import { BillingPeriod, PlanType, UserSubscription } from "../types/subscription";

// Prices in TRY
export const PRICING_CONFIG = {
  pro: { monthlyPrice: 99, yearlyPrice: 950, name: "Pro" },
  premium: { monthlyPrice: 249, yearlyPrice: 2390, name: "Premium" },
};

const memorySubscriptions = new Map<string, UserSubscription>();

export function isShopierConfigured(): boolean {
  return !!(process.env.SHOPIER_API_KEY && process.env.SHOPIER_API_SECRET);
}

function hmacBase64(data: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(data).digest("base64");
}

/** Order id format: NM-{PLAN}-{M|Y}-{userId}-{timestamp}. Firebase uids never contain "-". */
export function buildOrderId(plan: PlanType, period: BillingPeriod, userId: string): string {
  return `NM-${plan.toUpperCase()}-${period === "yearly" ? "Y" : "M"}-${userId}-${Date.now()}`;
}

export function parseOrderId(orderId: string): { plan: PlanType; period: BillingPeriod; userId: string } | null {
  const match = /^NM-(PRO|PREMIUM)-(M|Y)-([A-Za-z0-9_]+)-(\d+)$/.exec(orderId || "");
  if (!match) return null;
  return {
    plan: match[1].toLowerCase() as PlanType,
    period: match[2] === "Y" ? "yearly" : "monthly",
    userId: match[3],
  };
}

/**
 * Builds the Shopier payment form (fields are POSTed by the browser to Shopier).
 * Without Shopier credentials, a simulated checkout is returned for local testing.
 */
export function createShopierCheckoutSession(params: {
  userId: string;
  userEmail: string;
  plan: PlanType;
  billingPeriod: BillingPeriod;
}) {
  const { userId, userEmail, plan, billingPeriod } = params;
  const config = PRICING_CONFIG[plan === "premium" ? "premium" : "pro"];
  const amount = billingPeriod === "yearly" ? config.yearlyPrice : config.monthlyPrice;
  const platformOrderId = buildOrderId(plan, billingPeriod, userId);

  if (!isShopierConfigured()) {
    return {
      provider: "shopier",
      isTestMode: true,
      checkoutUrl: `/api/subscription/test-checkout?orderId=${encodeURIComponent(platformOrderId)}`,
      platformOrderId,
      amount,
      currency: "TRY",
    };
  }

  const apiKey = process.env.SHOPIER_API_KEY!;
  const apiSecret = process.env.SHOPIER_API_SECRET!;
  const totalOrderValue = amount.toFixed(2);
  const currency = 0; // TRY
  const randomNr = crypto.randomInt(100000, 999999);
  const localPart = (userEmail.split("@")[0] || "Kullanici").replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ]/g, "") || "Kullanici";

  const formData: Record<string, string | number> = {
    API_key: apiKey,
    website_index: Number(process.env.SHOPIER_WEBSITE_INDEX || 1),
    platform_order_id: platformOrderId,
    product_name: `NovaMind ${config.name} (${billingPeriod === "yearly" ? "Yıllık" : "Aylık"})`,
    product_type: 1, // digital
    buyer_name: localPart,
    buyer_surname: "NovaMind",
    buyer_email: userEmail,
    buyer_account_age: 0,
    buyer_id_nr: 0,
    buyer_phone: "05000000000",
    billing_address: "Dijital Ürün",
    billing_city: "İstanbul",
    billing_country: "Türkiye",
    billing_postcode: "34000",
    shipping_address: "Dijital Ürün",
    shipping_city: "İstanbul",
    shipping_country: "Türkiye",
    shipping_postcode: "34000",
    total_order_value: totalOrderValue,
    currency,
    platform: 0,
    is_in_frame: 0,
    current_language: 0,
    modul_version: "1.0.4",
    random_nr: randomNr,
  };
  formData.signature = hmacBase64(`${randomNr}${platformOrderId}${totalOrderValue}${currency}`, apiSecret);

  return {
    provider: "shopier",
    isTestMode: false,
    checkoutUrl: "https://www.shopier.com/ShowProduct/api_pay.php",
    platformOrderId,
    amount,
    currency: "TRY",
    formData,
  };
}

/** Shopier callback signature: base64(HMAC-SHA256(random_nr + platform_order_id, secret)). */
export function verifyShopierWebhookSignature(body: Record<string, any>): boolean {
  const apiSecret = process.env.SHOPIER_API_SECRET;
  if (!apiSecret) return false;

  const { random_nr, platform_order_id, signature } = body || {};
  if (!random_nr || !platform_order_id || !signature) return false;

  const expected = Buffer.from(hmacBase64(`${random_nr}${platform_order_id}`, apiSecret));
  const received = Buffer.from(String(signature));
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}

async function readSubscription(userId: string): Promise<UserSubscription | null> {
  if (firestoreDb) {
    const doc = await firestoreDb.collection("users").doc(userId).collection("subscription").doc("current").get();
    return doc.exists ? (doc.data() as UserSubscription) : null;
  }
  return memorySubscriptions.get(userId) || null;
}

/**
 * Activates or extends a subscription. Idempotent per order id, and renewals extend
 * from the current expiry instead of resetting it.
 */
export async function updateUserSubscriptionInDb(params: {
  userId: string;
  plan: PlanType;
  billingPeriod?: BillingPeriod;
  paymentProvider: "shopier" | "iyzico" | "manual";
  orderId?: string;
  customerEmail?: string;
}): Promise<UserSubscription> {
  const { userId, plan, billingPeriod = "monthly", paymentProvider, orderId, customerEmail } = params;
  const now = Date.now();
  const durationMs = (billingPeriod === "yearly" ? 365 : 31) * 24 * 60 * 60 * 1000;

  const existing = await readSubscription(userId).catch(() => null);
  const processed = existing?.processedOrderIds || [];
  if (orderId && processed.includes(orderId) && existing) return existing;

  const stillActive = existing && existing.plan !== "free" && existing.expiresAt > now;
  const subscription: UserSubscription = {
    userId,
    plan,
    status: "active",
    startsAt: stillActive ? existing!.startsAt : now,
    expiresAt: (stillActive && existing!.plan === plan ? existing!.expiresAt : now) + durationMs,
    billingPeriod,
    paymentProvider,
    ...(orderId ? { orderId } : {}),
    ...(customerEmail ? { customerEmail } : {}),
    processedOrderIds: orderId ? [...processed.slice(-49), orderId] : processed,
  };

  if (firestoreDb) {
    await firestoreDb.collection("users").doc(userId).collection("subscription").doc("current").set(subscription);
    await firestoreDb.collection("users").doc(userId).set({ plan, isPremium: true, updatedAt: now }, { merge: true });
  } else {
    memorySubscriptions.set(userId, subscription);
  }
  return subscription;
}

export async function getUserSubscriptionFromDb(userId: string): Promise<UserSubscription> {
  const free: UserSubscription = {
    userId,
    plan: "free",
    status: "active",
    startsAt: Date.now(),
    expiresAt: 0,
    paymentProvider: "manual",
  };

  try {
    const data = await readSubscription(userId);
    if (!data) return free;
    if (data.plan !== "free" && data.expiresAt < Date.now()) {
      return { ...data, plan: "free", status: "expired" };
    }
    const { processedOrderIds, ...publicData } = data;
    return publicData;
  } catch (e) {
    console.warn("Subscription fetch fallback:", e);
    return free;
  }
}
