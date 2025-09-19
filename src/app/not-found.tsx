"use client";

import Link from "next/link";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search, HelpCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-primary-50/30 dark:from-secondary-900 dark:to-primary-950/30 flex items-center justify-center">
      <MaxWidthWrapper>
        <div className="text-center">
          {/* 404 Animation */}
          <div className="mb-8">
            <div className="relative">
              <div className="text-display-2xl font-bold text-primary-600 dark:text-primary-400 mb-4">
                404
              </div>
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-accent-500 to-primary-500 rounded-2xl rotate-12 opacity-80 animate-bounce-in" />
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl -rotate-12 opacity-80 animate-bounce-in delay-500" />
            </div>
          </div>

          {/* Error Message */}
          <div className="mb-8">
            <h1 className="text-display-md mb-4 text-secondary-900 dark:text-secondary-100">
              Page Not Found
            </h1>
            <p className="text-body-lg text-secondary-600 dark:text-secondary-300 max-w-2xl mx-auto leading-relaxed">
              Oops! The page you&apos;re looking for seems to have wandered off
              into the digital void. Don&apos;t worry, even the best AI
              can&apos;t find everything!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>

          {/* Helpful Links */}
          <div className="glass rounded-2xl p-8 max-w-2xl mx-auto">
            <h2 className="text-heading-lg mb-6 text-secondary-900 dark:text-secondary-100">
              Maybe you were looking for:
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/dashboard" className="group">
                <div className="p-4 rounded-xl border border-secondary-200 dark:border-secondary-700 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                      <Search className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-heading-sm text-secondary-900 dark:text-secondary-100 group-hover:text-primary-600 dark:group-hover:text-primary-400">
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
                <div className="p-4 rounded-xl border border-secondary-200 dark:border-secondary-700 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center">
                      <HelpCircle className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-heading-sm text-secondary-900 dark:text-secondary-100 group-hover:text-primary-600 dark:group-hover:text-primary-400">
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
                <div className="p-4 rounded-xl border border-secondary-200 dark:border-secondary-700 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary-500 to-secondary-600 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">$</span>
                    </div>
                    <div className="text-left">
                      <div className="text-heading-sm text-secondary-900 dark:text-secondary-100 group-hover:text-primary-600 dark:group-hover:text-primary-400">
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
                <div className="p-4 rounded-xl border border-secondary-200 dark:border-secondary-700 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">?</span>
                    </div>
                    <div className="text-left">
                      <div className="text-heading-sm text-secondary-900 dark:text-secondary-100 group-hover:text-primary-600 dark:group-hover:text-primary-400">
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
              Even our AI couldn&apos;t find this page. Maybe it&apos;s taking a
              coffee break? ☕
            </p>
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  );
}
