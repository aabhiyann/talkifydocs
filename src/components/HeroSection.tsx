"use client";

import MaxWidthWrapper from "./MaxWidthWrapper";
import Link from "next/link";
import { ArrowRight, Sparkles, Zap, Shield } from "lucide-react";
import { marketing } from "@/content/marketing";
import { buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20 px-6">
      {/* Background Grid Pattern - Wist-Inspired */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-white dark:from-gray-950 dark:via-gray-950 dark:to-gray-900" />
        {/* Subtle gradient overlays */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-primary-400/10 to-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-primary-600/10 to-primary-400/10 rounded-full blur-3xl" />
      </div>

      <MaxWidthWrapper className="relative z-10 max-w-6xl">
        <div className="text-center space-y-8">
          {/* Badge - Wist Style */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-medium text-primary-600">
              Now with GPT-4o
            </span>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Headline - Large Serif Font */}
            <h1 className="text-6xl md:text-7xl font-bold mb-6 text-gray-900 dark:text-white font-serif tracking-tight animate-fade-in">
              AI Chat With a Brain.
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed animate-slide-up">
              Upload your PDFs and chat with them using advanced AI. 
              Get instant answers with citations.
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

          {/* Feature Cards - Wist Style */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            <div className="group bg-white dark:bg-gray-800 rounded-2xl p-8 hover:shadow-xl transition-shadow duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 font-serif">Lightning Fast</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get instant answers from your documents with our advanced AI processing
              </p>
            </div>

            <div className="group bg-white dark:bg-gray-800 rounded-2xl p-8 hover:shadow-xl transition-shadow duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 font-serif">Secure & Private</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your documents are encrypted and processed securely with enterprise-grade security
              </p>
            </div>

            <div className="group bg-white dark:bg-gray-800 rounded-2xl p-8 hover:shadow-xl transition-shadow duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 font-serif">Smart Analysis</h3>
              <p className="text-gray-600 dark:text-gray-400">
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
