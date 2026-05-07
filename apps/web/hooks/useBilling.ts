"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

type BillingState = {
  isPremium: boolean;
  plan: string | null;
  status: string | null;
  renewalDate: string | null;
};

const initialState: BillingState = {
  isPremium: false,
  plan: null,
  status: null,
  renewalDate: null,
};

export function useBilling() {
  const [billing, setBilling] = useState<BillingState>(initialState);

  useEffect(() => {
    async function loadBilling() {
      const supabase = createClient();
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.data?.user?.id;

      if (!userId) {
        setBilling(initialState);
        return;
      }

      const { data, error } = await supabase
        .from("stripe_subscriptions")
        .select("status, price_id, current_period_end")
        .eq("user_id", userId)
        .maybeSingle();

      if (error || !data) {
        setBilling(initialState);
        return;
      }

      setBilling({
        isPremium: data.status === "active" || data.status === "trialing",
        plan: data.price_id ?? null,
        status: data.status,
        renewalDate: data.current_period_end ?? null,
      });
    }

    loadBilling();
  }, []);

  return billing;
}
