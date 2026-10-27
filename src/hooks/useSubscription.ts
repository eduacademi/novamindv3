import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { UserSubscription, PlanFeatureLimits, PlanType, PLAN_LIMITS, UserUsageStats } from "../../server/types/subscription";
import { apiFetch, readApiError } from "../lib/api";

/** Browsers must POST the Shopier form, so build and submit it. */
function submitCheckoutForm(action: string, fields: Record<string, string | number>) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = action;
  form.style.display = "none";
  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = String(value);
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
}

export function useSubscription(userId: string | null, onRequireLogin?: () => void) {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [limits, setLimits] = useState<PlanFeatureLimits>(PLAN_LIMITS.free);
  const [usage, setUsage] = useState<UserUsageStats | null>(null);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSubscriptionStatus = useCallback(async () => {
    try {
      const response = await apiFetch("/api/subscription/status");
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
        setLimits(data.limits);
        setUsage(data.usage || null);
      }
    } catch (e) {
      console.warn("Failed to fetch subscription status:", e);
    }
  }, []);

  useEffect(() => {
    if (userId) fetchSubscriptionStatus();
  }, [userId, fetchSubscriptionStatus]);

  const initiateCheckout = async (plan: PlanType, billingPeriod: "monthly" | "yearly" = "monthly") => {
    setIsLoading(true);
    try {
      const response = await apiFetch("/api/subscription/create-checkout", {
        method: "POST",
        body: JSON.stringify({ plan, billingPeriod }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (data.requiresLogin) {
          setIsPricingModalOpen(false);
          onRequireLogin?.();
        }
        toast.error(data.error || (await readApiError(response, "Ödeme başlatılamadı.")));
        return;
      }

      if (data.formData) submitCheckoutForm(data.checkoutUrl, data.formData);
      else if (data.checkoutUrl) window.location.href = data.checkoutUrl;
    } catch (e) {
      console.error("Checkout initiation error:", e);
      toast.error("Ödeme sayfasına bağlanılamadı. Lütfen tekrar dene.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    subscription,
    limits,
    usage,
    isPricingModalOpen,
    setIsPricingModalOpen,
    initiateCheckout,
    isLoading,
    refreshSubscription: fetchSubscriptionStatus,
  };
}
