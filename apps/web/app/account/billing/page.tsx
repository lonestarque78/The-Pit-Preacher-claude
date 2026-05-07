"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function BillingPage() {
  const supabase = createClientComponentClient();

  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  const priceMap: Record<string, string> = {
    [process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID!]: "Basic (Monthly)",
    [process.env.NEXT_PUBLIC_STRIPE_BASIC_ANNUAL_PRICE_ID!]: "Basic (Annual)",
    [process.env.NEXT_PUBLIC_STRIPE_BACKYARD_PRICE_ID!]: "Backyard (Monthly)",
    [process.env.NEXT_PUBLIC_STRIPE_BACKYARD_ANNUAL_PRICE_ID!]: "Backyard (Annual)",
    [process.env.NEXT_PUBLIC_STRIPE_PITMASTER_PRICE_ID!]: "Pitmaster (Monthly)",
    [process.env.NEXT_PUBLIC_STRIPE_PITMASTER_ANNUAL_PRICE_ID!]: "Pitmaster (Annual)",
  };

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setUser(user);

      const { data: sub } = await supabase
        .from("stripe_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      setSubscription(sub);

      const { data: cust } = await supabase
        .from("stripe_customers")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      setCustomer(cust);

      setLoading(false);
    }

    load();
  }, []);

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

  if (loading) return <div className="p-6">Loading billing...</div>;

  const isSubscribed =
    subscription && subscription.status && subscription.status !== "canceled";

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

        {isSubscribed && (
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
