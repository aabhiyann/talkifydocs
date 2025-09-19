"use client";

import MaxWidthWrapper from "./MaxWidthWrapper";
import Link from "next/link";
import { ArrowRight, Sparkles, Zap, Shield } from "lucide-react";
import { buttonVariants } from "./ui/button";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950 dark:via-gray-900 dark:to-purple-950" />
      </div>

      <MaxWidthWrapper className="relative z-10">
        <div className="text-center space-y-8">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-blue-200/50 dark:border-blue-700/50 shadow-sm">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              AI-Powered Document Analysis
            </span>
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Transform your documents into intelligent conversations
            </h1>

            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              TalkifyDocs revolutionizes document interaction through advanced
              AI technology. Upload your PDFs, ask questions, and get instant,
              accurate answers from your content.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className={buttonVariants({
                size: "lg",
                className:
                  "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105",
              })}
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>

            <Link
              href="/pricing"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className:
                  "px-8 py-4 rounded-xl font-semibold border-2 border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 hover:scale-105",
              })}
            >
              View Pricing
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-blue-100/50 dark:border-blue-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Lightning Fast
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get instant answers from your documents with our advanced AI
                processing
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-blue-100/50 dark:border-blue-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Secure & Private
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your documents are encrypted and processed securely with
                enterprise-grade security
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-blue-100/50 dark:border-blue-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Smart Analysis
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Advanced AI understands context and provides intelligent,
                accurate responses
              </p>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </section>
  );
};

export default HeroSection;
