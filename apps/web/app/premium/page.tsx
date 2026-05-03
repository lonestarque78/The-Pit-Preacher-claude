// apps/web/app/premium/page.tsx
"use client";



import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { getTier } from "@/lib/premium";
import Button from "@/components/Button";
import Link from "next/link";

const TIERS = [
  {
    key: "basic",
    commandment: "The First Commandment",
    name: "Basic",
    price: "$3.99",
    period: "/mo",
    features: [
      "Meal Prep",
      "Cook Plan",
      "Cook Timeline",
      "Fire Management",
      "Seasoning & Rubs",
    ],
  },
  {
    key: "backyard",
    commandment: "The Second Commandment",
    name: "Backyard",
    price: "$7.99",
    period: "/mo",
    features: [
      "Everything in Basic",
      "Cook Logs",
      "Flavor Memory",
      "Wood Flavor Lab",
      "Fix My Cook Button",
    ],
  },
  {
    key: "pitmaster",
    commandment: "The Third Commandment",
    name: "Pitmaster",
    price: "$11.99",
    period: "/mo",
    features: [
      "Everything in Backyard",
      "Secret Finishing Moves",
      "Pit Preacher Challenges",
      "Smoke Color Interpreter",
      "Perfect Pairings Library",
      "The Pitmaster's Table",
    ],
  },
];

const TIER_ORDER = ["free", "basic", "backyard", "pitmaster"];

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

  async function startCheckout(tierKey: string) {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier: tierKey }),
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
            border: "1px solid var(--color-border)",
          }}
        >
          ✓ Current Plan
        </span>
      );
    }

    if (targetLevel > tierLevel) {
      return <Button onClick={() => startCheckout(tierKey)}>Upgrade</Button>;
    }

    return (
      <span
        style={{
          display: "inline-block",
          padding: "var(--space-2) var(--space-4)",
          fontFamily: "var(--font-ui)",
          color: "var(--color-text-muted)",
        }}
      >
        ✓ Included
      </span>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: "20px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.4rem" }}>Loading...</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px 24px" }}>
      <div style={{ marginBottom: "var(--space-3)" }}>
        <Link href="/dashboard" style={{ fontFamily: "var(--font-ui)", fontSize: "0.8rem", color: "var(--color-text-muted)", textDecoration: "none" }}>
          ← Dashboard
        </Link>
      </div>

      <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.4rem", marginBottom: "var(--space-2)", textAlign: "center" }}>
        Pit Preacher Premium
      </h1>

      <p style={{ marginBottom: "var(--space-3)", textAlign: "center", color: "var(--color-text-muted)", fontSize: "0.85rem", maxWidth: "500px", marginLeft: "auto", marginRight: "auto" }}>
        Choose the plan that fits your smoking style. Upgrade anytime to unlock more features.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "var(--space-3)", maxWidth: "1000px", margin: "0 auto" }}>
        {TIERS.map((tier) => (
          <div key={tier.key} style={{
            background: "var(--color-bg-alt)",
            padding: "var(--space-3)",
            borderRadius: "var(--radius-lg)",
            border: currentTier === tier.key ? "2px solid var(--color-accent)" : "2px solid transparent",
          }}>
            <p style={{ fontFamily: "var(--font-ui)", color: "var(--color-accent)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 var(--space-1)" }}>
              {tier.commandment}
            </p>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", marginBottom: "var(--space-1)" }}>
              {tier.name}
            </h2>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", marginBottom: "var(--space-1)" }}>
              {tier.price}
              <span style={{ fontSize: "0.9rem", color: "var(--color-text-muted)" }}>{tier.period}</span>
            </div>
            <ul style={{ marginBottom: "var(--space-3)", paddingLeft: "var(--space-3)", lineHeight: 1.6, fontSize: "0.875rem" }}>
              {tier.features.map((feature) => (
                <li key={feature} style={{ marginBottom: "2px" }}>{feature}</li>
              ))}
            </ul>
            <div>{getButton(tier.key)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
