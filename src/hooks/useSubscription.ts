import { useState, useEffect, useCallback } from "react";
import { UserSubscription, PlanFeatureLimits, PlanType, PLAN_LIMITS } from "../../server/types/subscription";

export function useSubscription() {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [limits, setLimits] = useState<PlanFeatureLimits>(PLAN_LIMITS.free);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSubscriptionStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/subscription/status");
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
        setLimits(data.limits);
      }
    } catch (e) {
      console.warn("Failed to fetch subscription status:", e);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, [fetchSubscriptionStatus]);

  const initiateCheckout = async (plan: PlanType, billingPeriod: "monthly" | "yearly" = "monthly") => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/subscription/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, billingPeriod })
      });
      const data = await response.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (e) {
      console.error("Checkout initiation error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    subscription,
    limits,
    isPricingModalOpen,
    setIsPricingModalOpen,
    initiateCheckout,
    isLoading,
    refreshSubscription: fetchSubscriptionStatus
  };
}
