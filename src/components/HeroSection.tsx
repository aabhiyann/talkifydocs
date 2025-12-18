"use client";

import MaxWidthWrapper from "./MaxWidthWrapper";
import Link from "next/link";
import { ArrowRight, Sparkles, Zap, Shield } from "lucide-react";
import { marketing } from "@/content/marketing";
import { buttonVariants } from "./ui/button";

const HeroSection = () => {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-20">
      <div className="absolute inset-0 -z-10 bg-background" />

      <MaxWidthWrapper className="relative z-10 max-w-6xl">
        <div className="space-y-8 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Now with Groq & Gemini</span>
          </div>

          <div className="space-y-6">
            <h1 className="mb-6 font-serif text-6xl font-bold tracking-tight text-foreground md:text-7xl">
              AI Chat With a Brain.
            </h1>

            <p className="mx-auto mb-8 max-w-2xl text-xl leading-relaxed text-muted-foreground">
              Upload your PDFs and chat with them using advanced AI. Get instant answers with
              citations.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/dashboard"
              className={buttonVariants({
                size: "lg",
                className: "bg-primary text-primary-foreground",
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
              })}
            >
              Try Demo
            </Link>

            <Link
              href="/pricing"
              className={buttonVariants({
                variant: "secondary",
                size: "lg",
              })}
            >
              {marketing.hero.ctas.secondary}
            </Link>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-3 font-serif text-xl font-semibold">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Get instant answers from your documents with our advanced AI processing
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-3 font-serif text-xl font-semibold">Secure & Private</h3>
              <p className="text-muted-foreground">
                Your documents are encrypted and processed securely with enterprise-grade security
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-3 font-serif text-xl font-semibold">Smart Analysis</h3>
              <p className="text-muted-foreground">
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
