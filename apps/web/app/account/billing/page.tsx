"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function BillingPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // -----------------------------
  // Local Types (Safe + Minimal)
  // -----------------------------
  type SubscriptionRow = {
    user_id: string;
    tier: string;
    status: string;
    current_period_end: string | null;
  };

  type CustomerRow = {
    id: string;
    user_id: string;
    stripe_customer_id: string;
  };

  type UserRow = {
    id: string;
    email?: string;
  };

  // -----------------------------
  // State
  // -----------------------------
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null);
  const [customer, setCustomer] = useState<CustomerRow | null>(null);
  const [user, setUser] = useState<UserRow | null>(null);

  const priceMap: Record<string, string> = {
    [process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID!]: "Basic (Monthly)",
    [process.env.NEXT_PUBLIC_STRIPE_BASIC_ANNUAL_PRICE_ID!]: "Basic (Annual)",
    [process.env.NEXT_PUBLIC_STRIPE_BACKYARD_PRICE_ID!]: "Backyard (Monthly)",
    [process.env.NEXT_PUBLIC_STRIPE_BACKYARD_ANNUAL_PRICE_ID!]: "Backyard (Annual)",
    [process.env.NEXT_PUBLIC_STRIPE_PITMASTER_PRICE_ID!]: "Pitmaster (Monthly)",
    [process.env.NEXT_PUBLIC_STRIPE_PITMASTER_ANNUAL_PRICE_ID!]: "Pitmaster (Annual)",
  };

  const priceToTier: Record<string, string> = {
    [process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID!]: "basic",
    [process.env.NEXT_PUBLIC_STRIPE_BASIC_ANNUAL_PRICE_ID!]: "basic",
    [process.env.NEXT_PUBLIC_STRIPE_BACKYARD_PRICE_ID!]: "backyard",
    [process.env.NEXT_PUBLIC_STRIPE_BACKYARD_ANNUAL_PRICE_ID!]: "backyard",
    [process.env.NEXT_PUBLIC_STRIPE_PITMASTER_PRICE_ID!]: "pitmaster",
    [process.env.NEXT_PUBLIC_STRIPE_PITMASTER_ANNUAL_PRICE_ID!]: "pitmaster",
  };

  const TIER_ORDER = ["free", "basic", "backyard", "pitmaster"];

  const TIERS = [
    {
      key: "basic",
      label: "Basic",
      monthly: { label: "Basic — $3.99/mo", priceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID! },
      annual: { label: "Basic — $29.99/yr (save ~37%)", priceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_ANNUAL_PRICE_ID! },
    },
    {
      key: "backyard",
      label: "Backyard",
      monthly: { label: "Backyard — $7.99/mo", priceId: process.env.NEXT_PUBLIC_STRIPE_BACKYARD_PRICE_ID! },
      annual: { label: "Backyard — $79.99/yr (save ~16%)", priceId: process.env.NEXT_PUBLIC_STRIPE_BACKYARD_ANNUAL_PRICE_ID! },
    },
    {
      key: "pitmaster",
      label: "Pitmaster",
      monthly: { label: "Pitmaster — $11.99/mo", priceId: process.env.NEXT_PUBLIC_STRIPE_PITMASTER_PRICE_ID! },
      annual: { label: "Pitmaster — $119.99/yr (save ~17%)", priceId: process.env.NEXT_PUBLIC_STRIPE_PITMASTER_ANNUAL_PRICE_ID! },
    },
  ];

  // -----------------------------
  // Load Billing Data
  // -----------------------------
  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setUser({ id: user.id, email: user.email ?? undefined });

      const { data: sub } = await supabase
        .from("subscriptions")
        .select("user_id, tier, status, current_period_end")
        .eq("user_id", user.id)
        .maybeSingle();

      setSubscription(sub as SubscriptionRow | null);

      const { data: cust } = await supabase
        .from("stripe_customers")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      setCustomer(cust as CustomerRow | null);

      setLoading(false);
    }

    load();
  }, []);

  // -----------------------------
  // Checkout
  // -----------------------------
  async function startCheckout(priceId: string) {
    const token = (await supabase.auth.getSession()).data.session?.access_token;

    const res = await fetch("/api/billing/create-checkout-session", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ priceId }),
    });

    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

  // -----------------------------
  // Portal
  // -----------------------------
  async function openPortal() {
    const token = (await supabase.auth.getSession()).data.session?.access_token;

    const res = await fetch("/api/billing/portal", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

  // -----------------------------
  // Loading
  // -----------------------------
  if (loading) return <div className="p-6">Loading billing...</div>;

  // -----------------------------
  // Subscription Status
  // -----------------------------
  const isSubscribed =
    subscription?.status && subscription.status !== "inactive";

  const currentTierKey =
    isSubscribed && subscription
      ? (subscription.tier ?? "free")
      : "free";

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Billing</h1>

      {/* Current Plan */}
      <div className="p-4 rounded-lg" style={{ background: "var(--color-bg-alt)", border: "1px solid rgba(201,151,58,0.15)" }}>
        <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--color-text)" }}>Your Plan</h2>

        {!isSubscribed && (
          <p className="mb-4" style={{ color: "var(--color-text-muted)" }}>
            You are currently on the <strong>Free Plan</strong>.
          </p>
        )}

        {isSubscribed && subscription && (
          <>
            <p style={{ color: "var(--color-text)" }}>
              <strong>Plan:</strong>{" "}
              {subscription.tier
                ? subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)
                : "Unknown Plan"}
            </p>
            <p style={{ color: "var(--color-text)" }}>
              <strong>Status:</strong> {subscription.status}
            </p>
            <p style={{ color: "var(--color-text)" }}>
              <strong>Renews:</strong>{" "}
              {subscription.current_period_end
                ? new Date(subscription.current_period_end).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                : "—"}
            </p>
          </>
        )}

        {isSubscribed && (
          <button
            onClick={openPortal}
            className="mt-4 px-4 py-2 rounded-lg"
            style={{ background: "transparent", border: "1px solid var(--color-accent)", color: "var(--color-accent)" }}
          >
            Manage Subscription
          </button>
        )}
      </div>

      {/* View / Change Plan */}
      <div className="flex flex-col items-center gap-2">
        <a
          href="/premium"
          className="w-full text-center px-4 py-3 rounded-lg font-medium"
          style={{ background: "transparent", border: "1px solid var(--color-accent)", color: "var(--color-accent)" }}
        >
          View or change your plan →
        </a>
        <button
          onClick={openPortal}
          className="text-xs"
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}
        >
          Manage subscription settings
        </button>
      </div>
    </div>
  );
}
