"use client";

import { useState, useEffect } from "react";
import MaxWidthWrapper from "./MaxWidthWrapper";
import Link from "next/link";
import { ArrowRight, Sparkles, Zap, Shield } from "lucide-react";
import { buttonVariants } from "./ui/button";
import Image from "next/image";

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-primary-950 dark:via-secondary-900 dark:to-accent-950" />
        
        {/* Animated Background Shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-accent-200/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-secondary-200/30 rounded-full blur-3xl animate-pulse delay-2000" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23000000" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40" />
      </div>

      <MaxWidthWrapper className="relative z-10">
        <div className={`text-center space-y-modern transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/80 dark:bg-secondary-800/80 backdrop-blur-sm border border-primary-200/50 dark:border-primary-700/50 shadow-soft animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
              AI-Powered Document Analysis
            </span>
          </div>

          {/* Main Heading */}
          <div className="space-y-6">
            <h1 className="text-display-2xl md:text-display-xl lg:text-display-2xl bg-gradient-to-r from-primary-600 via-accent-600 to-primary-600 bg-clip-text text-transparent animate-slide-up">
              Transform your{" "}
              <span className="relative">
                documents
                <div className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-primary-400/30 to-accent-400/30 rounded-full -z-10" />
              </span>{" "}
              into intelligent conversations
            </h1>
            
            <p className="text-body-lg text-secondary-600 dark:text-secondary-300 max-w-3xl mx-auto leading-relaxed animate-slide-up delay-200">
              TalkifyDocs revolutionizes document interaction through advanced AI technology. 
              Upload your PDFs, ask questions, and get instant, accurate answers from your content.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up delay-300">
            <Link
              href="/dashboard"
              className={`${buttonVariants({ 
                size: "lg", 
                className: "group relative overflow-hidden bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" 
              })}`}
            >
              <span className="relative z-10 flex items-center">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-accent-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
            
            <Link
              href="/pricing"
              className={`${buttonVariants({ 
                variant: "outline", 
                size: "lg",
                className: "group px-8 py-4 rounded-xl font-semibold border-2 border-primary-200 dark:border-primary-700 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-300 hover:scale-105" 
              })}`}
            >
              View Pricing
            </Link>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 animate-slide-up delay-400">
            <div className="group p-6 rounded-2xl bg-white/60 dark:bg-secondary-800/60 backdrop-blur-sm border border-primary-100/50 dark:border-primary-700/50 hover:bg-white/80 dark:hover:bg-secondary-800/80 transition-all duration-300 hover:scale-105 hover:shadow-medium">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-heading-md text-secondary-900 dark:text-secondary-100 mb-2">
                Lightning Fast
              </h3>
              <p className="text-body-sm text-secondary-600 dark:text-secondary-400">
                Get instant answers from your documents with our advanced AI processing
              </p>
            </div>

            <div className="group p-6 rounded-2xl bg-white/60 dark:bg-secondary-800/60 backdrop-blur-sm border border-primary-100/50 dark:border-primary-700/50 hover:bg-white/80 dark:hover:bg-secondary-800/80 transition-all duration-300 hover:scale-105 hover:shadow-medium">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-heading-md text-secondary-900 dark:text-secondary-100 mb-2">
                Secure & Private
              </h3>
              <p className="text-body-sm text-secondary-600 dark:text-secondary-400">
                Your documents are encrypted and processed securely with enterprise-grade security
              </p>
            </div>

            <div className="group p-6 rounded-2xl bg-white/60 dark:bg-secondary-800/60 backdrop-blur-sm border border-primary-100/50 dark:border-primary-700/50 hover:bg-white/80 dark:hover:bg-secondary-800/80 transition-all duration-300 hover:scale-105 hover:shadow-medium">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary-500 to-secondary-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-heading-md text-secondary-900 dark:text-secondary-100 mb-2">
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
