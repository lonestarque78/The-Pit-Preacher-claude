// apps/web/app/api/checkout/route.ts
import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2026-03-25.dahlia",
});

const PRICE_IDS: Record<string, string> = {
  basic: "price_basic_monthly",
  pitmaster: "price_pitmaster_monthly",
};

export async function POST(request: Request) {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const tier = body.tier || "basic";

  const priceId = PRICE_IDS[tier];
  if (!priceId) {
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  }

  // Check if user already has a subscription
  const { data: existingSub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  let customerId = existingSub?.stripe_customer_id;

  // Create Stripe customer if not exists
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: {
        userId: user.id,
      },
    });
    customerId = customer.id;

    // Store the stripe_customer_id on subscriptions table
    await supabase.from("subscriptions").insert({
      user_id: user.id,
      tier: "free",
      status: "active",
      stripe_customer_id: customerId,
    });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${siteUrl}/premium/success`,
    cancel_url: `${siteUrl}/premium/cancel`,
    metadata: {
      userId: user.id,
      tier,
    },
  });

  return NextResponse.json({ url: session.url });
}
