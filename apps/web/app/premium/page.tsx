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
    annualMonthlyPrice: "$3.19",
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
    annualMonthlyPrice: "$6.39",
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
    annualMonthlyPrice: "$9.59",
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

const MONTHLY_PRICE_IDS: Record<string, string> = {
  basic: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID!,
  backyard: process.env.NEXT_PUBLIC_STRIPE_BACKYARD_PRICE_ID!,
  pitmaster: process.env.NEXT_PUBLIC_STRIPE_PITMASTER_PRICE_ID!,
};

const ANNUAL_PRICE_IDS: Record<string, string> = {
  basic: process.env.NEXT_PUBLIC_STRIPE_BASIC_ANNUAL_PRICE_ID!,
  backyard: process.env.NEXT_PUBLIC_STRIPE_BACKYARD_ANNUAL_PRICE_ID!,
  pitmaster: process.env.NEXT_PUBLIC_STRIPE_PITMASTER_ANNUAL_PRICE_ID!,
};

export default function PremiumPage() {
  const supabase = createClient();
  const [currentTier, setCurrentTier] = useState<string>("free");
  const [loading, setLoading] = useState(true);
  const [pitmasterTrialAvailable, setPitmasterTrialAvailable] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        getTier(data.user.id, supabase).then((tier) => {
          setCurrentTier(tier || "free");
        });

        // Check if user qualifies for Pitmaster trial
        supabase
          .from("subscriptions")
          .select("id")
          .eq("user_id", data.user.id)
          .eq("tier", "pitmaster")
          .maybeSingle()
          .then(({ data: priorSub }) => {
            setPitmasterTrialAvailable(!priorSub);
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
    if (!res.ok) {
      alert(data.error);
      return;
    }
    if (data.url) window.location.href = data.url;
  }

  async function startCheckout(tierKey: string) {
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    const res = await fetch("/api/billing/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ priceId: isAnnual ? ANNUAL_PRICE_IDS[tierKey] : MONTHLY_PRICE_IDS[tierKey] }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else if (data.error) {
      alert(data.error);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: "20px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.4rem" }}>Loading...</h1>
      </div>
    );
  }

  return (
    <div className="pricing-outer">
      <style>{`
        .pricing-outer {
          box-sizing: border-box;
          padding: 12px 24px 32px;
          max-width: 1100px;
          margin: 0 auto;
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          align-items: stretch;
        }

        .pricing-card {
          background: var(--color-bg-alt);
          border-radius: 8px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .pricing-card-commandment {
          font-family: var(--font-ui);
          color: #C9973A;
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin: 0 0 8px;
        }

        .pricing-card-name {
          font-family: var(--font-heading);
          font-size: 1.4rem;
          color: #F5E6C8;
          margin: 0 0 6px;
        }

        .pricing-card-tagline {
          font-family: var(--font-body);
          font-style: italic;
          font-size: 0.875rem;
          color: #D9C9A8;
          margin: 0 0 12px;
          line-height: 1.5;
        }

        .pricing-card-price {
          font-family: var(--font-heading);
          font-size: 1.6rem;
          color: #F5E6C8;
          margin: 0 0 4px;
          line-height: 1;
        }

        .pricing-card-price-period {
          font-size: 0.85rem;
          color: var(--color-text-muted);
          font-family: var(--font-body);
        }

        .pricing-card-annual-label {
          font-family: var(--font-body);
          font-size: 0.72rem;
          color: var(--color-text-muted);
          margin: 0 0 16px;
          line-height: 1;
        }

        /* Web savings banner */
        .web-savings-banner {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          background: rgba(201,151,58,0.06);
          border: 1px solid rgba(201,151,58,0.22);
          border-left: 3px solid #C9973A;
          border-radius: 8px;
          padding: 14px 18px;
          margin-bottom: 24px;
        }

        .web-savings-icon {
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          background: rgba(201,151,58,0.12);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #C9973A;
          font-size: 0.9rem;
          margin-top: 1px;
        }

        .web-savings-body {
          flex: 1;
          min-width: 0;
        }

        .web-savings-headline {
          font-family: var(--font-ui);
          font-size: 0.82rem;
          color: #F5E6C8;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin: 0 0 4px;
          line-height: 1.3;
        }

        .web-savings-subtext {
          font-family: var(--font-body);
          font-size: 0.8rem;
          color: var(--color-text-muted);
          margin: 0;
          line-height: 1.55;
        }

        .web-savings-subtext strong {
          color: #D9C9A8;
          font-style: normal;
        }

        /* Per-card web price badge */
        .web-price-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-family: var(--font-ui);
          font-size: 0.6rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #C9973A;
          background: rgba(201,151,58,0.1);
          border: 1px solid rgba(201,151,58,0.3);
          border-radius: 3px;
          padding: 2px 7px;
          margin-bottom: 14px;
          white-space: nowrap;
        }

        /* Billing toggle */
        .billing-toggle-wrap {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
        }

        .billing-toggle-label {
          font-family: var(--font-ui);
          font-size: 0.8rem;
          color: var(--color-text-muted);
          cursor: pointer;
          user-select: none;
          transition: color 0.15s;
        }

        .billing-toggle-label.active {
          color: #F5E6C8;
        }

        .billing-toggle-track {
          position: relative;
          width: 44px;
          height: 24px;
          background: rgba(201,151,58,0.15);
          border: 1px solid rgba(201,151,58,0.3);
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
          flex-shrink: 0;
        }

        .billing-toggle-track.on {
          background: rgba(201,151,58,0.25);
          border-color: rgba(201,151,58,0.6);
        }

        .billing-toggle-thumb {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 16px;
          height: 16px;
          background: #C9973A;
          border-radius: 50%;
          transition: transform 0.2s;
        }

        .billing-toggle-track.on .billing-toggle-thumb {
          transform: translateX(20px);
        }

        .billing-save-badge {
          font-family: var(--font-ui);
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #1a1007;
          background: #C9973A;
          border-radius: 4px;
          padding: 2px 7px;
          font-weight: 700;
          white-space: nowrap;
          transition: opacity 0.2s;
        }

        .billing-save-badge.hidden {
          opacity: 0;
          pointer-events: none;
        }

        .pricing-card-divider {
          border: none;
          border-top: 1px solid rgba(201,151,58,0.15);
          margin: 0 0 14px;
        }

        .pricing-card-features {
          list-style: none;
          margin: 0 0 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }

        .pricing-card-feature {
          font-family: var(--font-body);
          font-size: 0.85rem;
          line-height: 1.45;
          color: var(--color-text-muted);
          display: flex;
          gap: 8px;
          align-items: flex-start;
        }

        .pricing-card-feature-dot {
          color: #C9973A;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .pricing-card-cta {
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid rgba(201,151,58,0.15);
        }

        .pricing-card-cta button,
        .pricing-card-cta span {
          width: 100%;
          display: block;
          text-align: center;
          box-sizing: border-box;
        }

        .pricing-current-badge {
          display: block;
          width: 100%;
          box-sizing: border-box;
          padding: 12px 20px;
          background: var(--color-bg-alt);
          border-radius: var(--radius-md);
          font-family: var(--font-ui);
          color: var(--color-text-muted);
          border: 1px solid rgba(201,151,58,0.25);
          font-size: 0.9rem;
          text-align: center;
        }

        .pricing-trial-badge {
          display: inline-block;
          background: linear-gradient(135deg, rgba(201, 151, 58, 0.2), rgba(201, 151, 58, 0.1));
          border: 1px solid rgba(201, 151, 58, 0.4);
          border-radius: 4px;
          padding: 6px 12px;
          font-family: var(--font-ui);
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #C9973A;
          font-weight: 600;
          margin-bottom: 12px;
        }

        @media (max-width: 768px) {
          .pricing-outer {
            padding: 12px 16px 40px;
          }

          .pricing-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .pricing-card {
            padding: 20px;
          }
        }
      `}</style>

      {/* Back nav */}
      <div style={{ marginBottom: "8px" }}>
        <Link href="/dashboard" style={{ fontFamily: "var(--font-ui)", fontSize: "0.8rem", color: "var(--color-text-muted)", textDecoration: "none" }}>
          ← Dashboard
        </Link>
      </div>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: "0.7rem", color: "#C9973A", textTransform: "uppercase", letterSpacing: "0.2em", margin: "0 0 4px" }}>
          The Congregation
        </p>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.8rem, 4vw, 2.5rem)", color: "#F5E6C8", margin: "0 0 6px" }}>
          Plans & Pricing
        </h1>
        <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)", fontSize: "0.9rem", maxWidth: "480px", margin: "0 auto", lineHeight: 1.6 }}>
          Choose the plan that fits the way you cook. Upgrade anytime.
        </p>
      </div>

      {/* Billing toggle */}
      <div className="billing-toggle-wrap">
        <span
          className={`billing-toggle-label${!isAnnual ? " active" : ""}`}
          onClick={() => setIsAnnual(false)}
        >
          Monthly
        </span>
        <div
          className={`billing-toggle-track${isAnnual ? " on" : ""}`}
          onClick={() => setIsAnnual((v) => !v)}
          role="switch"
          aria-checked={isAnnual}
        >
          <div className="billing-toggle-thumb" />
        </div>
        <span
          className={`billing-toggle-label${isAnnual ? " active" : ""}`}
          onClick={() => setIsAnnual(true)}
        >
          Annual
        </span>
        <span className={`billing-save-badge${isAnnual ? "" : " hidden"}`}>Save 20%</span>
      </div>

      {/* Web vs App Store savings banner */}
      <div className="web-savings-banner">
        <div className="web-savings-icon">$</div>
        <div className="web-savings-body">
          <p className="web-savings-headline">Subscribe on the web and save</p>
          <p className="web-savings-subtext">
            Our website prices are lower than the App Store —&nbsp;
            <strong>same features, same Preacher, just less.</strong>&nbsp;
            Apple charges a fee on in-app purchases, so we pass the savings to you here.
          </p>
        </div>
      </div>

      {/* Tier cards */}
      <div className="pricing-grid">
        {TIERS.map((tier) => (
          <div
            key={tier.key}
            className="pricing-card"
            style={{
              border: currentTier === tier.key
                ? "2px solid #C9973A"
                : "1px solid rgba(201,151,58,0.15)",
            }}
          >
            {tier.key === "pitmaster" && pitmasterTrialAvailable && (
              <div className="pricing-trial-badge">🎁 7-Day Free Trial</div>
            )}
            <p className="pricing-card-commandment">{tier.commandment}</p>
            <h2 className="pricing-card-name">{tier.name}</h2>
            <p className="pricing-card-tagline">{tier.tagline}</p>
            <div className="pricing-card-price">
              {isAnnual ? tier.annualMonthlyPrice : tier.price}
              <span className="pricing-card-price-period">{tier.period}</span>
            </div>
            {isAnnual && (
              <p className="pricing-card-annual-label">billed annually</p>
            )}
            <div style={{ marginTop: isAnnual ? "8px" : "10px" }}>
              <span className="web-price-badge">
                ↓ Lower than App Store
              </span>
            </div>
            <hr className="pricing-card-divider" style={{ marginTop: "10px" }} />
            <ul className="pricing-card-features">
              {tier.features.map((feature) => (
                <li key={feature} className="pricing-card-feature">
                  <span className="pricing-card-feature-dot">·</span>
                  {feature}
                </li>
              ))}
            </ul>
            <div className="pricing-card-cta">
              {currentTier === tier.key ? (
                <span className="pricing-current-badge">✓ Current Plan</span>
              ) : TIER_ORDER.indexOf(tier.key) > TIER_ORDER.indexOf(currentTier) ? (
                <Button onClick={() => startCheckout(tier.key)} style={{ width: "100%" }}>Upgrade</Button>
              ) : (
                <Button onClick={openPortal} style={{ width: "100%" }}>Downgrade</Button>
              )}
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
        margin: "20px 0 0",
        fontStyle: "italic",
      }}>
        All plans include a free tier to get started. Cancel anytime.
      </p>
    </div>
  );
}
