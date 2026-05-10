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
    tagline: "You shall not cook blind.",
    price: "$3.99",
    period: "/mo",
    description: "The Preacher speaks. Ask anything about your cook, your pit, or your meat. Unlimited questions. No more guessing.",
    features: [
      "Ask the Preacher — unlimited questions",
      "Smart Cook Planner",
      "Fire & Time Blueprint",
      "Pitmaster's Playbook — foundational modules",
      "Smoker Profile Engine",
    ],
  },
  {
    key: "backyard",
    commandment: "The Second Commandment",
    name: "Backyard",
    tagline: "You shall tend the pit with purpose.",
    price: "$7.99",
    period: "/mo",
    description: "Everything in Basic, plus the full Pitmaster's Playbook, Pit Rescue Mode, and your Cook Log. Your setup, your wood, your history — all in one place.",
    features: [
      "Everything in Basic",
      "Full Pitmaster's Playbook",
      "Pit Rescue Mode",
      "Cook Log & Notes",
      "Flavor Autograph Builder",
      "Wood Flavor Lab",
    ],
  },
  {
    key: "pitmaster",
    commandment: "The Third Commandment",
    name: "Pitmaster",
    tagline: "You shall know yourself as a cook.",
    price: "$11.99",
    period: "/mo",
    description: "The full congregation. Trend Analysis, Meat Profiles, Pit Profiles, Cook Confidence Scores, Fire Control Scores, Deep Insights, and a personalized strategy before every cook.",
    features: [
      "Everything in Backyard",
      "Trend Analysis",
      "Meat & Pit Profiles",
      "Cook Confidence Score",
      "Fire Control Score",
      "Next Cook Strategy Card",
      "Deep Insights Overlay",
    ],
  },
];

const TIER_ORDER = ["free", "basic", "backyard", "pitmaster"];

export default function PremiumPage() {
  const supabase = createClient();
  const [currentTier, setCurrentTier] = useState<string>("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  async function openPortal() {
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    const res = await fetch("/api/billing/portal", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

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
        <span style={{
          display: "inline-block",
          padding: "var(--space-2) var(--space-4)",
          background: "var(--color-bg-alt)",
          borderRadius: "var(--radius-md)",
          fontFamily: "var(--font-ui)",
          color: "var(--color-text-muted)",
          border: "1px solid var(--color-border)",
          fontSize: "0.85rem",
        }}>
          ✓ Current Plan
        </span>
      );
    }

    if (targetLevel > tierLevel) {
      return <Button onClick={() => startCheckout(tierKey)}>Upgrade</Button>;
    }

    return <Button onClick={openPortal}>Downgrade</Button>;
  }

  if (loading) {
    return (
      <div style={{ padding: "20px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.4rem" }}>Loading...</h1>
      </div>
    );
  }

  return (
    <div style={{
      height: "100vh",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      boxSizing: "border-box",
      padding: "12px 24px",
      maxWidth: "1100px",
      margin: "0 auto",
    }}>

      {/* Back nav */}
      <div style={{ marginBottom: "8px" }}>
        <Link href="/dashboard" style={{ fontFamily: "var(--font-ui)", fontSize: "0.8rem", color: "var(--color-text-muted)", textDecoration: "none" }}>
          ← Dashboard
        </Link>
      </div>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "12px" }}>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: "0.7rem", color: "#C9973A", textTransform: "uppercase", letterSpacing: "0.2em", margin: "0 0 4px" }}>
          The Congregation
        </p>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.8rem, 4vw, 2.5rem)", color: "#F5E6C8", margin: "0 0 4px" }}>
          Plans & Pricing
        </h1>
        <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)", fontSize: "0.9rem", maxWidth: "480px", margin: "0 auto", lineHeight: 1.6 }}>
          Choose the plan that fits the way you cook. Upgrade anytime.
        </p>
      </div>

      {/* Tier cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "var(--space-3)",
        alignItems: "stretch",
        flex: 1,
        minHeight: 0,
      }}>
        {TIERS.map((tier) => (
          <div
            key={tier.key}
            style={{
              background: "var(--color-bg-alt)",
              padding: "16px",
              borderRadius: "8px",
              border: currentTier === tier.key
                ? "2px solid #C9973A"
                : "1px solid rgba(201,151,58,0.15)",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              overflow: "hidden",
            }}
          >
            {/* Commandment label */}
            <p style={{
              fontFamily: "var(--font-ui)",
              color: "#C9973A",
              fontSize: "0.65rem",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              margin: 0,
            }}>
              {tier.commandment}
            </p>

            {/* Tier name */}
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.3rem", color: "#F5E6C8", margin: 0 }}>
              {tier.name}
            </h2>

            {/* Tagline */}
            <p style={{
              fontFamily: "var(--font-body)",
              fontStyle: "italic",
              fontSize: "0.9rem",
              color: "#D9C9A8",
              margin: 0,
              lineHeight: 1.5,
            }}>
              {tier.tagline}
            </p>

            {/* Price */}
            <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.4rem", color: "#F5E6C8", margin: 0 }}>
              {tier.price}
              <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>{tier.period}</span>
            </div>

            {/* Features */}
            <ul style={{ margin: "4px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "4px" }}>
              {tier.features.slice(0, 4).map((feature) => (
                <li key={feature} style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.75rem",
                  lineHeight: 1.4,
                  color: "var(--color-text-muted)",
                  display: "flex",
                  gap: "8px",
                  alignItems: "flex-start",
                }}>
                  <span style={{ color: "#C9973A", flexShrink: 0 }}>·</span>
                  {feature}
                </li>
              ))}
              {tier.features.length > 4 && (
                <li style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.75rem",
                  color: "var(--color-text-muted)",
                  opacity: 0.5,
                  paddingLeft: "16px",
                }}>
                  ...and more
                </li>
              )}
            </ul>

            {/* CTA */}
            <div style={{ marginTop: "auto", paddingTop: "8px" }}>
              {getButton(tier.key)}
            </div>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <p style={{
        fontFamily: "var(--font-body)",
        fontSize: "0.8rem",
        color: "var(--color-text-muted)",
        textAlign: "center",
        margin: "8px 0 0",
        fontStyle: "italic",
      }}>
        All plans include a free tier to get started. Cancel anytime.
      </p>
    </div>
  );
}
