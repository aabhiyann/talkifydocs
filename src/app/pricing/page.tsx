// import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/dist/types/server";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { UpgradeButton } from "@/components/UpgradeButton";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PLANS } from "@/config/stripe";
import { getCurrentUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { ArrowRight, Check, HelpCircle, Minus } from "lucide-react";
import Link from "next/link";

const Page = async () => {
  const user = await getCurrentUser();

  const pricingItems = [
    {
      plan: "Free",
      tagline: "Perfect for getting started.",
      quota: 10,
      features: [
        {
          text: "5 pages per PDF",
          footnote: "The maximum amount of pages per PDF-file.",
        },
        {
          text: "4MB file size limit",
          footnote: "The maximum file size of a single PDF file.",
        },
        {
          text: "Mobile-friendly interface",
        },
        {
          text: "Higher-quality responses",
          footnote: "Better algorithmic responses for enhanced content quality",
          negative: true,
        },
        {
          text: "Priority support",
          negative: true,
        },
      ],
    },
    {
      plan: "Pro",
      tagline: "Ideal for professional use.",
      quota: PLANS.find((p) => p.slug === "pro")!.quota,
      features: [
        {
          text: "25 pages per PDF",
          footnote: "The maximum amount of pages per PDF-file.",
        },
        {
          text: "16MB file size limit",
          footnote: "The maximum file size of a single PDF file.",
        },
        {
          text: "Mobile-friendly interface",
        },
        {
          text: "Higher-quality responses",
          footnote: "Better algorithmic responses for enhanced content quality",
        },
        {
          text: "Priority support",
        },
      ],
    },
  ];

  return (
    <>
      <MaxWidthWrapper className="mb-8 mt-24 max-w-5xl text-center">
        <div className="mx-auto mb-12 text-center sm:max-w-2xl">
          <h1 className="text-display-lg font-extrabold text-secondary-900 dark:text-secondary-100">
            Simple, transparent pricing
          </h1>
          <p className="text-body-lg mt-6 leading-relaxed text-secondary-600 dark:text-secondary-300">
            Choose the perfect plan for your document analysis needs. Start with our free tier or
            upgrade for advanced features and higher limits.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 pt-12 lg:grid-cols-2">
          <TooltipProvider>
            {pricingItems.map(({ plan, tagline, quota, features }) => {
              const price = PLANS.find((p) => p.slug === plan.toLowerCase())?.price.amount || 0;

              return (
                <Card
                  key={plan}
                  hover={true}
                  className={cn(
                    "relative",
                    {
                      "shadow-primary-200/50 border-2 border-primary-600": plan === "Pro",
                      // "border border-secondary-200 dark:border-secondary-700": plan !== "Pro", // Handled by Card default
                    },
                  )}
                >
                  {plan === "Pro" && (
                    <div className="gradient-primary absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full px-3 py-2 text-sm font-medium text-white">
                      Upgrade now
                    </div>
                  )}

                  <div className="p-5">
                    <h3 className="text-heading-xl my-3 text-center font-bold text-secondary-900 dark:text-secondary-100">
                      {plan}
                    </h3>
                    <p className="text-secondary-600 dark:text-secondary-400">{tagline}</p>
                    <p className="text-display-lg my-5 font-semibold text-primary-600">${price}</p>
                    <p className="text-secondary-600 dark:text-secondary-400">Per Month</p>
                  </div>

                  <div className="flex h-20 items-center justify-center border-b border-t border-secondary-200 bg-secondary-50 dark:border-secondary-700 dark:bg-secondary-800">
                    <div className="flex items-center space-x-1">
                      <p className="text-secondary-700 dark:text-secondary-300">
                        {quota.toLocaleString()} PDFs/month included
                      </p>

                      <Tooltip delayDuration={300}>
                        <TooltipTrigger className="ml-1.5 cursor-default">
                          <HelpCircle className="h-4 w-4 text-secondary-500" />
                        </TooltipTrigger>
                        <TooltipContent className="w-80 p-2">
                          The number of PDFs you can upload per month.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  <ul className="my-10 space-y-5 px-8">
                    {features.map(({ text, footnote, negative }) => (
                      <li key={text} className="space-x5 flex">
                        <div className="flex-shrink-0">
                          {negative ? (
                            <Minus className="h-6 w-6 text-secondary-300" />
                          ) : (
                            <Check className="h-6 w-6 text-primary-500" />
                          )}
                        </div>
                        {footnote ? (
                          <div className="flex items-center space-x-1">
                            <p
                              className={cn("text-secondary-500 dark:text-secondary-400", {
                                "text-secondary-600 dark:text-secondary-300": negative,
                              })}
                            >
                              {text}
                            </p>
                            <Tooltip delayDuration={300}>
                              <TooltipTrigger className="ml-1.5 cursor-default">
                                <HelpCircle className="h-4 w-4 text-secondary-500" />
                              </TooltipTrigger>
                              <TooltipContent className="w-80 p-2">{footnote}</TooltipContent>
                            </Tooltip>
                          </div>
                        ) : (
                          <p
                            className={cn("text-secondary-500 dark:text-secondary-400", {
                              "text-secondary-600 dark:text-secondary-300": negative,
                            })}
                          >
                            {text}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>

                  <div className="border-t border-secondary-200 dark:border-secondary-700" />
                  <div className="p-5">
                    {plan === "Free" ? (
                      <Link
                        href={user ? "/dashboard" : "/sign-in"}
                        className={buttonVariants({
                          className: "w-full",
                          variant: "secondary",
                        })}
                      >
                        {user ? "Upgrade now" : "Sign up"}
                        <ArrowRight className="ml-1.5 h-5 w-5" />
                      </Link>
                    ) : user ? (
                      <UpgradeButton />
                    ) : (
                      <Link
                        href="/sign-in"
                        className={buttonVariants({
                          className: "w-full",
                        })}
                      >
                        {user ? "Upgrade now" : "Sign up"}
                        <ArrowRight className="ml-1.5 h-5 w-5" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </TooltipProvider>
        </div>
      </MaxWidthWrapper>
    </>
  );
};

export default Page;
