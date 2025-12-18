import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import type Stripe from "stripe";
import { loggers } from "@/lib/logger";

export async function POST(request: Request) {
  if (!stripe) {
    loggers.api.error("Stripe not configured in webhook");
    return new Response("Stripe not configured", { status: 500 });
  }

  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("Stripe-Signature") ?? "";

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || "",
    );
  } catch (err) {
    loggers.api.error({ err }, "Stripe webhook signature verification failed");
    return new Response(`Webhook Error: ${err instanceof Error ? err.message : "Unknown Error"}`, {
      status: 400,
    });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (!session?.metadata?.userId) {
    return new Response(null, {
      status: 200,
    });
  }

  if (event.type === "checkout.session.completed") {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

    await db.user.update({
      where: {
        id: session.metadata.userId,
      },
      data: {
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: subscription.items.data[0]?.price.id,
        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });

    loggers.api.info({ userId: session.metadata.userId }, "Subscription completed");
  }

  if (event.type === "invoice.payment_succeeded") {
    // Retrieve the subscription details from Stripe.
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

    await db.user.update({
      where: {
        stripeSubscriptionId: subscription.id,
      },
      data: {
        stripePriceId: subscription.items.data[0]?.price.id,
        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });

    loggers.api.info({ subscriptionId: subscription.id }, "Payment succeeded, subscription updated");
  }

  return new Response(null, { status: 200 });
}
