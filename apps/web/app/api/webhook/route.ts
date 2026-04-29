import { NextResponse } from "next/server";
import type Stripe from "stripe";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  const stripe = new (await import("stripe")).default(process.env.STRIPE_SECRET_KEY!);
  const supabase = (await import("@supabase/supabase-js")).createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        // Get the subscription to find the price/tier
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price.id ?? "";
        const tier = getTierFromPriceId(priceId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawPeriodEnd = (subscription as any).current_period_end as number | undefined;
        const periodEnd = rawPeriodEnd ? new Date(rawPeriodEnd * 1000).toISOString() : null;

        // Find user by stripe_customer_id
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
        }

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const priceId = subscription.items.data[0]?.price.id ?? "";
        const tier = getTierFromPriceId(priceId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawEnd = (subscription as any).current_period_end as number | undefined;
        const periodEnd = rawEnd ? new Date(rawEnd * 1000).toISOString() : null;
        const status = subscription.status === "active" ? "active" : "inactive";

        await supabase
          .from("subscriptions")
          .update({
            tier,
            status,
            current_period_end: periodEnd,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId);

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

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
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

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
        // Ignore unhandled event types
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
    [process.env.STRIPE_PRICE_BASIC_MONTHLY!]: "basic",
    [process.env.STRIPE_PRICE_BASIC_ANNUAL!]: "basic",
    [process.env.STRIPE_PRICE_BACKYARD_MONTHLY!]: "backyard",
    [process.env.STRIPE_PRICE_BACKYARD_ANNUAL!]: "backyard",
    [process.env.STRIPE_PRICE_PITMASTER_MONTHLY!]: "pitmaster",
    [process.env.STRIPE_PRICE_PITMASTER_ANNUAL!]: "pitmaster",
  };

  return priceMap[priceId] ?? "free";
}