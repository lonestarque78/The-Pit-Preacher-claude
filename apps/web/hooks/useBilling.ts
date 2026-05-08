"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export interface BillingState {
  isPremium: boolean;
  plan: string | null;
  status: string | null;
  renewalDate: string | null;
}

export function useBilling(): BillingState {
  const [billingState, setBillingState] = useState<BillingState>({
    isPremium: false,
    plan: null,
    status: null,
    renewalDate: null,
  });

  useEffect(() => {
    async function loadBillingStatus() {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Get the current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const userId = userData?.user?.id ?? null;

      if (userError || !userId) {
        setBillingState({
          isPremium: false,
          plan: null,
          status: null,
          renewalDate: null,
        });
        return;
      }

      // Fetch billing information
      const { data, error } = await supabase
        .from("billing")
        .select("plan, status, renewal_date")
        .eq("user_id", userId)
        .maybeSingle();

      if (error || !data) {
        setBillingState({
          isPremium: false,
          plan: null,
          status: null,
          renewalDate: null,
        });
        return;
      }

      setBillingState({
        isPremium: data.plan === "premium" || data.plan === "pro",
        plan: data.plan ?? null,
        status: data.status ?? null,
        renewalDate: data.renewal_date ?? null,
      });
    }

    loadBillingStatus();
  }, []);

  return billingState;
}
