// apps/web/app/api/checkout/route.ts
import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2026-03-25.dahlia",
});

const PRICE_IDS: Record<string, string | undefined> = {
  basic:     process.env.STRIPE_BASIC_PRICE_ID,
  backyard:  process.env.STRIPE_BACKYARD_PRICE_ID,
  pitmaster: process.env.STRIPE_PITMASTER_PRICE_ID,
};

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const tier = body.tier || "basic";
  const priceId = PRICE_IDS[tier];

  if (!priceId) {
    return NextResponse.json({ error: "Invalid tier or price not configured" }, { status: 400 });
  }

  const customer = await stripe.customers.create({
    email: user.email,
    metadata: { userId: user.id },
  });
  const customerId = customer.id;

  await supabase.from("subscriptions").upsert(
    { user_id: user.id, tier: "free", status: "active", stripe_customer_id: customerId },
    { onConflict: "user_id", ignoreDuplicates: false }
  );

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${siteUrl}/premium/success`,
    cancel_url: `${siteUrl}/premium/cancel`,
    metadata: { userId: user.id, tier },
  });

  return NextResponse.json({ url: session.url });
}