"use client";

import MaxWidthWrapper from "./MaxWidthWrapper";
import Link from "next/link";
import { ArrowRight, Sparkles, Zap, Shield } from "lucide-react";
import { marketing } from "@/content/marketing";
import { buttonVariants } from "./ui/button";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-primary-950 dark:via-secondary-900 dark:to-accent-950" />
        {/* Animated Background Shapes */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-primary-400/20 to-accent-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-accent-400/20 to-primary-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <MaxWidthWrapper className="relative z-10">
        <div className="text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass border border-primary-200/50 dark:border-primary-700/50 shadow-soft">
            <Sparkles className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
              {marketing.hero.badge}
            </span>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            <h1 className="text-display-2xl md:text-display-xl lg:text-display-2xl font-extrabold bg-gradient-to-r from-primary-600 via-accent-600 to-primary-600 bg-clip-text text-transparent animate-fade-in">
              {marketing.hero.heading}
            </h1>

            <p className="text-body-lg text-secondary-600 dark:text-secondary-300 max-w-3xl mx-auto leading-relaxed animate-slide-up">
              {marketing.hero.subheading}
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
            <Link
              href="/dashboard"
              className={buttonVariants({
                size: "lg",
                className:
                  "gradient-primary hover:shadow-strong text-white px-8 py-4 rounded-xl font-semibold shadow-medium hover:shadow-dramatic transition-all duration-300 hover:scale-105 focus-ring",
              })}
            >
              {marketing.hero.ctas.primary}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>

            <Link
              href="/demo"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className:
                  "px-8 py-4 rounded-xl font-semibold border-2 border-dashed border-primary-300 dark:border-primary-600 hover:bg-primary-50/60 dark:hover:bg-primary-900/20 transition-all duration-300 hover:scale-105 focus-ring",
              })}
            >
              Try Demo
            </Link>

            <Link
              href="/pricing"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className:
                  "px-8 py-4 rounded-xl font-semibold border-2 border-primary-200 dark:border-primary-700 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-300 hover:scale-105 focus-ring",
              })}
            >
              {marketing.hero.ctas.secondary}
            </Link>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="group glass rounded-2xl p-6 border border-primary-100/50 dark:border-primary-700/50 hover:bg-white/80 dark:hover:bg-secondary-800/80 transition-all duration-300 hover:scale-105 hover:shadow-strong animate-bounce-in">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-heading-lg text-secondary-900 dark:text-secondary-100 mb-2">
                Lightning Fast
              </h3>
              <p className="text-body-sm text-secondary-600 dark:text-secondary-400">
                Get instant answers from your documents with our advanced AI processing
              </p>
            </div>

            <div className="group glass rounded-2xl p-6 border border-primary-100/50 dark:border-primary-700/50 hover:bg-white/80 dark:hover:bg-secondary-800/80 transition-all duration-300 hover:scale-105 hover:shadow-strong animate-bounce-in delay-200">
              <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-heading-lg text-secondary-900 dark:text-secondary-100 mb-2">
                Secure & Private
              </h3>
              <p className="text-body-sm text-secondary-600 dark:text-secondary-400">
                Your documents are encrypted and processed securely with enterprise-grade security
              </p>
            </div>

            <div className="group glass rounded-2xl p-6 border border-primary-100/50 dark:border-primary-700/50 hover:bg-white/80 dark:hover:bg-secondary-800/80 transition-all duration-300 hover:scale-105 hover:shadow-strong animate-bounce-in delay-400">
              <div className="w-12 h-12 rounded-xl gradient-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-heading-lg text-secondary-900 dark:text-secondary-100 mb-2">
                Smart Analysis
              </h3>
              <p className="text-body-sm text-secondary-600 dark:text-secondary-400">
                Advanced AI understands context and provides intelligent, accurate responses
              </p>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </section>
  );
};

export default HeroSection;
