"use client";

import Link from "next/link";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search, HelpCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="to-primary-50/30 dark:to-primary-950/30 flex min-h-screen items-center justify-center bg-gradient-to-b from-white dark:from-secondary-900">
      <MaxWidthWrapper>
        <div className="text-center">
          {/* 404 Animation */}
          <div className="mb-8">
            <div className="relative">
              <div className="text-display-2xl mb-4 font-bold text-primary-600 dark:text-primary-400">
                404
              </div>
              <div className="animate-bounce-in absolute -right-4 -top-4 h-16 w-16 rotate-12 rounded-2xl bg-gradient-to-br from-accent-500 to-primary-500 opacity-80" />
              <div className="animate-bounce-in absolute -bottom-4 -left-4 h-12 w-12 -rotate-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 opacity-80 delay-500" />
            </div>
          </div>

          {/* Error Message */}
          <div className="mb-8">
            <h1 className="text-display-md mb-4 text-secondary-900 dark:text-secondary-100">
              Page Not Found
            </h1>
            <p className="text-body-lg mx-auto max-w-2xl leading-relaxed text-secondary-600 dark:text-secondary-300">
              Oops! The page you&apos;re looking for seems to have wandered off into the digital
              void. Don&apos;t worry, even the best AI can&apos;t find everything!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700"
              >
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            </Link>
            <Button variant="outline" size="lg" onClick={() => window.history.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>

          {/* Helpful Links */}
          <div className="glass mx-auto max-w-2xl rounded-2xl p-8">
            <h2 className="text-heading-lg mb-6 text-secondary-900 dark:text-secondary-100">
              Maybe you were looking for:
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Link href="/dashboard" className="group">
                <div className="dark:hover:bg-primary-900/20 rounded-xl border border-secondary-200 p-4 transition-all duration-200 hover:border-primary-300 hover:bg-primary-50 dark:border-secondary-700 dark:hover:border-primary-600">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-600">
                      <Search className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-heading-sm text-secondary-900 group-hover:text-primary-600 dark:text-secondary-100 dark:group-hover:text-primary-400">
                        Dashboard
                      </div>
                      <div className="text-body-sm text-secondary-600 dark:text-secondary-400">
                        Manage your documents
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/features" className="group">
                <div className="dark:hover:bg-primary-900/20 rounded-xl border border-secondary-200 p-4 transition-all duration-200 hover:border-primary-300 hover:bg-primary-50 dark:border-secondary-700 dark:hover:border-primary-600">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-500 to-accent-600">
                      <HelpCircle className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-heading-sm text-secondary-900 group-hover:text-primary-600 dark:text-secondary-100 dark:group-hover:text-primary-400">
                        Features
                      </div>
                      <div className="text-body-sm text-secondary-600 dark:text-secondary-400">
                        Explore our capabilities
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/pricing" className="group">
                <div className="dark:hover:bg-primary-900/20 rounded-xl border border-secondary-200 p-4 transition-all duration-200 hover:border-primary-300 hover:bg-primary-50 dark:border-secondary-700 dark:hover:border-primary-600">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-secondary-500 to-secondary-600">
                      <span className="text-sm font-bold text-white">$</span>
                    </div>
                    <div className="text-left">
                      <div className="text-heading-sm text-secondary-900 group-hover:text-primary-600 dark:text-secondary-100 dark:group-hover:text-primary-400">
                        Pricing
                      </div>
                      <div className="text-body-sm text-secondary-600 dark:text-secondary-400">
                        View our plans
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/contact" className="group">
                <div className="dark:hover:bg-primary-900/20 rounded-xl border border-secondary-200 p-4 transition-all duration-200 hover:border-primary-300 hover:bg-primary-50 dark:border-secondary-700 dark:hover:border-primary-600">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-accent-500">
                      <span className="text-sm font-bold text-white">?</span>
                    </div>
                    <div className="text-left">
                      <div className="text-heading-sm text-secondary-900 group-hover:text-primary-600 dark:text-secondary-100 dark:group-hover:text-primary-400">
                        Contact
                      </div>
                      <div className="text-body-sm text-secondary-600 dark:text-secondary-400">
                        Get help & support
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Fun Message */}
          <div className="mt-8 text-center">
            <p className="text-body-sm text-secondary-500 dark:text-secondary-500">
              Even our AI couldn&apos;t find this page. Maybe it&apos;s taking a coffee break? ☕
            </p>
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  );
}
