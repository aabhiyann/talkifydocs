import { PLANS } from "@/config/stripe";
import { db } from "@/db";
import { getCurrentUser } from "@/lib/auth";
import Stripe from "stripe";
import { env } from "./env";

export const stripe = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
      typescript: true,
    })
  : null;

export async function getUserSubscriptionPlan() {
  const user = await getCurrentUser();

  if (!user || !user.id) {
    return {
      ...PLANS[0],
      isSubscribed: false,
      isCanceled: false,
      stripeCurrentPeriodEnd: null,
    };
  }

  const dbUser = await db.user.findFirst({
    where: {
      id: user.id,
    },
  });

  if (!dbUser) {
    return {
      ...PLANS[0],
      isSubscribed: false,
      isCanceled: false,
      stripeCurrentPeriodEnd: null,
    };
  }

  const isSubscribed = Boolean(
    dbUser.stripePriceId &&
    dbUser.stripeCurrentPeriodEnd && // 86400000 = 1 day
    dbUser.stripeCurrentPeriodEnd.getTime() + 86_400_000 > Date.now(),
  );

  const plan =
    isSubscribed && PLANS.find((plan) => plan.price.priceIds.test === dbUser.stripePriceId);

  let isCanceled = false;
  if (isSubscribed && dbUser.stripeSubscriptionId && stripe) {
    const stripePlan = await stripe.subscriptions.retrieve(dbUser.stripeSubscriptionId);
    isCanceled = stripePlan.cancel_at_period_end;
  }

  const basePlan = plan ?? PLANS[0];

  return {
    ...basePlan,
    stripeSubscriptionId: dbUser.stripeSubscriptionId,
    stripeCurrentPeriodEnd: dbUser.stripeCurrentPeriodEnd,
    stripeCustomerId: dbUser.stripeCustomerId,
    isSubscribed,
    isCanceled,
  };
}
