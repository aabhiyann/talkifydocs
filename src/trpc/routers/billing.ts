import { TRPCError } from "@trpc/server";

import { db } from "@/lib/db";
import { absoluteUrl } from "@/lib/utils";

import { privateProcedure } from "../trpc";

/**
 * Stripe-related tRPC procedures, extracted from the historical
 * mega-router. Currently this is just `createStripeSession`, which:
 *
 *   - Routes existing subscribers to a Stripe billing portal
 *   - Routes non-subscribers into a Pro-tier checkout session
 *
 * The Stripe SDK and the PLANS config are dynamically imported (the same
 * way the original inline procedure did it) so we don't pull Stripe into
 * every server bundle that just wants the rest of the tRPC router.
 */
export const billingProcedures = {
  createStripeSession: privateProcedure.mutation(async ({ ctx }) => {
    const { userId } = ctx;

    const billingUrl = absoluteUrl("/dashboard/billing");

    // privateProcedure already enforces auth, but we re-check to keep the
    // explicit error symmetric with the original implementation and the
    // billing test (which expects UNAUTHORIZED if userId is missing).
    if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

    const dbUser = await db.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        stripeCustomerId: true,
      },
    });

    if (!dbUser) throw new TRPCError({ code: "UNAUTHORIZED" });

    const { getUserSubscriptionPlan, stripe } = await import("@/lib/stripe");
    const { PLANS } = await import("@/config/stripe");

    const subscriptionPlan = await getUserSubscriptionPlan();

    if (!stripe) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Stripe not configured",
      });
    }

    if (subscriptionPlan.isSubscribed && dbUser.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: dbUser.stripeCustomerId,
        return_url: billingUrl,
      });

      return { url: stripeSession.url };
    }

    const stripeSession = await stripe.checkout.sessions.create({
      success_url: billingUrl,
      cancel_url: billingUrl,
      payment_method_types: ["card"],
      mode: "subscription",
      billing_address_collection: "auto",
      line_items: [
        {
          price: PLANS.find((plan) => plan.name === "Pro")?.price.priceIds.test,
          quantity: 1,
        },
      ],
      metadata: {
        userId: userId,
      },
    });

    return { url: stripeSession.url };
  }),
} as const;
