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
    id: string;
    user_id: string;
    price_id: string;
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
        .from("stripe_subscriptions")
        .select("*")
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
    subscription?.status && subscription.status !== "canceled";

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Billing</h1>

      {/* Current Plan */}
      <div className="p-4 border rounded-lg bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-2">Your Plan</h2>

        {!isSubscribed && (
          <p className="text-gray-600 mb-4">
            You are currently on the <strong>Free Plan</strong>.
          </p>
        )}

        {isSubscribed && subscription && (
          <>
            <p className="text-gray-700">
              <strong>Plan:</strong>{" "}
              {priceMap[subscription.price_id] ?? "Unknown Plan"}
            </p>
            <p className="text-gray-700">
              <strong>Status:</strong> {subscription.status}
            </p>
            <p className="text-gray-700">
              <strong>Renews:</strong>{" "}
              {subscription.current_period_end
                ? new Date(subscription.current_period_end).toLocaleDateString()
                : "—"}
            </p>
          </>
        )}

        {/* Manage Subscription */}
        {isSubscribed && (
          <button
            onClick={openPortal}
            className="mt-4 px-4 py-2 bg-black text-white rounded-lg"
          >
            Manage Subscription
          </button>
        )}
      </div>

      {/* Upgrade Options */}
      {!isSubscribed && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Upgrade Your Plan</h2>

          <p className="text-gray-600">
            Save 15% by subscribing on the website.
          </p>

          <div className="grid gap-4">
            {/* Basic */}
            <button
              onClick={() =>
                startCheckout(process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID!)
              }
              className="p-4 border rounded-lg bg-white shadow-sm hover:bg-gray-50"
            >
              Basic — $X/mo
            </button>

            {/* Backyard */}
            <button
              onClick={() =>
                startCheckout(process.env.NEXT_PUBLIC_STRIPE_BACKYARD_PRICE_ID!)
              }
              className="p-4 border rounded-lg bg-white shadow-sm hover:bg-gray-50"
            >
              Backyard — $X/mo
            </button>

            {/* Pitmaster */}
            <button
              onClick={() =>
                startCheckout(process.env.NEXT_PUBLIC_STRIPE_PITMASTER_PRICE_ID!)
              }
              className="p-4 border rounded-lg bg-white shadow-sm hover:bg-gray-50"
            >
              Pitmaster — $X/mo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
