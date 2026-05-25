import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const CheckoutSessionEventSchema = z.object({
  customer: z.string({ error: "customer is required on checkout.session.completed" }),
  subscription: z.string({ error: "subscription is required on checkout.session.completed" }),
});

const SubscriptionEventSchema = z.object({
  id: z.string(),
  customer: z.string({ error: "customer is required on subscription event" }),
  status: z.string(),
  items: z.object({
    data: z.array(z.object({ price: z.object({ id: z.string() }) })),
  }),
  current_period_end: z.number().optional(),
});

const InvoiceEventSchema = z.object({
  customer: z.string({ error: "customer is required on invoice.payment_failed" }),
});

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const sessionParse = CheckoutSessionEventSchema.safeParse(event.data.object);
        if (!sessionParse.success) {
          console.error("checkout.session.completed data validation failed:", sessionParse.error.flatten().fieldErrors);
          return NextResponse.json({ error: "Invalid event data", details: sessionParse.error.flatten().fieldErrors }, { status: 400 });
        }
        const { customer: customerId, subscription: subscriptionId } = sessionParse.data;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price.id ?? "";
        const tier = getTierFromPriceId(priceId);
        const rawPeriodEnd = (subscription as any).current_period_end as number | undefined;
        const periodEnd = rawPeriodEnd ? new Date(rawPeriodEnd * 1000).toISOString() : null;

        const { data: existing } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (existing) {
          await supabase
            .from("subscriptions")
            .update({
              stripe_subscription_id: subscriptionId,
              tier,
              status: "active",
              current_period_end: periodEnd,
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_customer_id", customerId);
        } else {
          // New billing flow: row not pre-created, look up user via stripe_customers
          const { data: customerRow } = await supabase
            .from("stripe_customers")
            .select("user_id")
            .eq("customer_id", customerId)
            .maybeSingle();

          if (customerRow?.user_id) {
            await supabase.from("subscriptions").upsert(
              {
                user_id: customerRow.user_id,
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
                tier,
                status: "active",
                current_period_end: periodEnd,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "user_id" }
            );
          }
        }

        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subParse = SubscriptionEventSchema.safeParse(event.data.object);
        if (!subParse.success) {
          console.error(`${event.type} data validation failed:`, subParse.error.flatten().fieldErrors);
          return NextResponse.json({ error: "Invalid event data", details: subParse.error.flatten().fieldErrors }, { status: 400 });
        }
        const { id: subscriptionId, customer: customerId, status: stripeStatus, items, current_period_end } = subParse.data;
        const priceId = items.data[0]?.price.id ?? "";
        const tier = getTierFromPriceId(priceId);
        const periodEnd = current_period_end ? new Date(current_period_end * 1000).toISOString() : null;
        const status = ["active", "trialing", "past_due"].includes(stripeStatus)
          ? stripeStatus
          : "inactive";

        const { data: existing } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();

        if (existing) {
          await supabase
            .from("subscriptions")
            .update({
              stripe_subscription_id: subscriptionId,
              tier,
              status,
              current_period_end: periodEnd,
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_customer_id", customerId);
        } else {
          const { data: customerRow } = await supabase
            .from("stripe_customers")
            .select("user_id")
            .eq("customer_id", customerId)
            .maybeSingle();

          if (customerRow?.user_id) {
            await supabase.from("subscriptions").upsert(
              {
                user_id: customerRow.user_id,
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
                tier,
                status,
                current_period_end: periodEnd,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "user_id" }
            );
          }
        }

        break;
      }

      case "customer.subscription.deleted": {
        const deletedSubParse = SubscriptionEventSchema.safeParse(event.data.object);
        if (!deletedSubParse.success) {
          console.error("customer.subscription.deleted data validation failed:", deletedSubParse.error.flatten().fieldErrors);
          return NextResponse.json({ error: "Invalid event data", details: deletedSubParse.error.flatten().fieldErrors }, { status: 400 });
        }
        const { customer: customerId } = deletedSubParse.data;

        await supabase
          .from("subscriptions")
          .update({
            tier: "free",
            status: "inactive",
            stripe_subscription_id: null,
            current_period_end: null,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId);

        break;
      }

      case "invoice.payment_failed": {
        const invoiceParse = InvoiceEventSchema.safeParse(event.data.object);
        if (!invoiceParse.success) {
          console.error("invoice.payment_failed data validation failed:", invoiceParse.error.flatten().fieldErrors);
          return NextResponse.json({ error: "Invalid event data", details: invoiceParse.error.flatten().fieldErrors }, { status: 400 });
        }
        const { customer: customerId } = invoiceParse.data;

        await supabase
          .from("subscriptions")
          .update({
            status: "past_due",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId);

        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

function getTierFromPriceId(priceId: string): string {
  const priceMap: Record<string, string> = {
    [process.env.STRIPE_BASIC_PRICE_ID!]: "basic",
    [process.env.NEXT_PUBLIC_STRIPE_BASIC_ANNUAL_PRICE_ID!]: "basic",
    [process.env.STRIPE_BACKYARD_PRICE_ID!]: "backyard",
    [process.env.NEXT_PUBLIC_STRIPE_BACKYARD_ANNUAL_PRICE_ID!]: "backyard",
    [process.env.STRIPE_PITMASTER_PRICE_ID!]: "pitmaster",
    [process.env.NEXT_PUBLIC_STRIPE_PITMASTER_ANNUAL_PRICE_ID!]: "pitmaster",
  };

  return priceMap[priceId] ?? "free";
}
