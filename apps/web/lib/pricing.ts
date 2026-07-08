// apps/web/lib/pricing.ts
// Single source of truth for Pitmaster pricing/copy, shared by /premium and /account/billing.

export const PITMASTER_MONTHLY_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PITMASTER_PRICE_ID!;
export const PITMASTER_ANNUAL_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PITMASTER_ANNUAL_PRICE_ID!;

export const PITMASTER_TIER = {
  key: "pitmaster",
  commandment: "The First Commandment",
  name: "Pitmaster",
  tagline: "You shall know yourself as a cook.",
  price: "$7.99",
  annualMonthlyPrice: "$6.25",
  annualPrice: "$74.99",
  period: "/mo",
  description:
    "The full congregation. Unlimited Preacher chat, unlimited cooks, and the Deep Insights Overlay — Trend Analysis, Meat & Pit Profiles, Cook Confidence Scores, Fire Control Scores, and a personalized strategy before every cook.",
  features: [
    "Ask the Preacher — unlimited questions",
    "Unlimited cooks",
    "Cook Confidence Score",
    "Fire Control Score",
    "Trend Analysis",
    "Meat & Pit Profiles",
    "Next Cook Strategy Card",
    "Deep Insights Overlay",
  ],
};
