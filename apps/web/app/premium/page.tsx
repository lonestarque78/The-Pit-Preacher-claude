// apps/web/app/premium/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { getTier } from "@/lib/premium";
import Button from "@/components/Button";
import Link from "next/link";

const TIERS = {
  basic: {
    name: "Basic",
    price: "$7.99",
    period: "/mo",
    features: [
      "Cook Plan",
      "Timeline",
      "Fire Management",
      "Seasoning & Rubs",
    ],
  },
  pitmaster: {
    name: "Pitmaster",
    price: "$11.99",
    period: "/mo",
    features: [
      "Everything in Basic",
      "Cook Logs",
      "Flavor Memory",
      "Fix My Cook",
      "Wood Flavor Lab",
      "All Premium Features",
    ],
  },
};

const TIER_ORDER = ["free", "basic", "pitmaster"];

export default function PremiumPage() {
  const [currentTier, setCurrentTier] = useState<string>("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        getTier(data.user.id, supabase).then((tier) => {
          setCurrentTier(tier || "free");
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });
  }, []);

  async function startCheckout(tier: string) {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tier }),
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else if (data.error) {
      alert(data.error);
    }
  }

  function getButton(tierKey: string) {
    const tierLevel = TIER_ORDER.indexOf(currentTier);
    const targetLevel = TIER_ORDER.indexOf(tierKey);

    if (tierKey === currentTier) {
      return (
        <span
          style={{
            display: "inline-block",
            padding: "var(--space-2) var(--space-4)",
            background: "var(--color-bg-alt)",
            borderRadius: "var(--radius-md)",
            fontFamily: "var(--font-ui)",
            color: "var(--color-text-muted)",
          }}
        >
          Current Plan
        </span>
      );
    }

    if (targetLevel > tierLevel) {
      return <Button onClick={() => startCheckout(tierKey)}>Upgrade</Button>;
    }

    return (
      <Button onClick={() => startCheckout(tierKey)}>
        Switch Plan
      </Button>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: "40px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)" }}>Loading...</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1
        style={{
          fontFamily: "var(--font-heading)",
          marginBottom: "var(--space-4)",
          textAlign: "center",
        }}
      >
        Pit Preacher Premium
      </h1>

      <p
        style={{
          marginBottom: "var(--space-5)",
          textAlign: "center",
          color: "var(--color-text-muted)",
          maxWidth: "600px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        Choose the plan that fits your smoking style. Upgrade anytime to unlock more features.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "var(--space-4)",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        {Object.entries(TIERS).map(([tierKey, tier]) => (
          <div
            key={tierKey}
            style={{
              background: "var(--color-bg-alt)",
              padding: "var(--space-4)",
              borderRadius: "var(--radius-lg)",
              border: currentTier === tierKey 
                ? "2px solid var(--color-accent)" 
                : "2px solid transparent",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.5rem",
                marginBottom: "var(--space-2)",
              }}
            >
              {tier.name}
            </h2>

            <div
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "2rem",
                marginBottom: "var(--space-1)",
              }}
            >
              {tier.price}
              <span
                style={{
                  fontSize: "1rem",
                  color: "var(--color-text-muted)",
                }}
              >
                {tier.period}
              </span>
            </div>

            <ul
              style={{
                marginBottom: "var(--space-4)",
                paddingLeft: "var(--space-4)",
                lineHeight: 1.8,
              }}
            >
              {tier.features.map((feature) => (
                <li key={feature} style={{ marginBottom: "var(--space-1)" }}>
                  {feature}
                </li>
              ))}
            </ul>

            <div>{getButton(tierKey)}</div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: "var(--space-5)" }}>
        <Link
          href="/dashboard"
          style={{
            fontFamily: "var(--font-ui)",
            color: "var(--color-text-muted)",
            textDecoration: "underline",
          }}
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
