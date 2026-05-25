import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const CheckoutRequestSchema = z.object({
  priceId: z.string().min(1, "priceId is required"),
});

// Build whitelist of allowed Stripe price IDs from environment variables
function getAllowedPriceIds(): Set<string> {
  const allowedPriceIds = new Set<string>();

  const priceIdEnvs = [
    process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID,
    process.env.NEXT_PUBLIC_STRIPE_BACKYARD_PRICE_ID,
    process.env.NEXT_PUBLIC_STRIPE_PITMASTER_PRICE_ID,
    process.env.NEXT_PUBLIC_STRIPE_BASIC_ANNUAL_PRICE_ID,
    process.env.NEXT_PUBLIC_STRIPE_BACKYARD_ANNUAL_PRICE_ID,
    process.env.NEXT_PUBLIC_STRIPE_PITMASTER_ANNUAL_PRICE_ID,
    process.env.NEXT_PUBLIC_STRIPE_PHOTO_PACK_PRICE_ID,
  ];

  for (const priceId of priceIdEnvs) {
    if (priceId) {
      allowedPriceIds.add(priceId);
    }
  }

  return allowedPriceIds;
}

export async function POST(req: NextRequest) {
  try {
    const bodyParseResult = CheckoutRequestSchema.safeParse(await req.json());
    if (!bodyParseResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: bodyParseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { priceId } = bodyParseResult.data;

    // Validate priceId against whitelist
    const allowedPriceIds = getAllowedPriceIds();
    if (!allowedPriceIds.has(priceId)) {
      return NextResponse.json(
        { error: "Invalid price ID" },
        { status: 400 }
      );
    }

    const authHeader = req.headers.get("Authorization");
    const accessToken = authHeader?.replace("Bearer ", "");

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const {
      data: { user },
    } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: existingCustomer } = await supabase
      .from("stripe_customers")
      .select("customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    let customerId = existingCustomer?.customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { supabase_user_id: user.id },
      });

      customerId = customer.id;

      await supabase.from("stripe_customers").insert({
        user_id: user.id,
        customer_id: customerId,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/account/billing?status=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/account/billing?status=cancelled`,
      allow_promotion_codes: true,
      automatic_tax: { enabled: true },
      customer_update: {
        address: "auto",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout session error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
