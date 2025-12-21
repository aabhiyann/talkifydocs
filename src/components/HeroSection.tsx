"use client";

import MaxWidthWrapper from "./MaxWidthWrapper";
import Link from "next/link";
import { ArrowRight, Sparkles, Play } from "lucide-react";
import { Button } from "./ui/button";

const HeroSection = () => {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-20">
      {/* Background grid pattern */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <MaxWidthWrapper className="relative z-10 max-w-6xl">
        <div className="text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex animate-in fade-in-50 slide-in-from-top-3 duration-500 items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-2 dark:border-primary-800 dark:bg-primary-900/20">
            <Sparkles className="h-4 w-4 text-primary-600" />
            <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
              Now with GPT-4o and Claude 3.5 Sonnet
            </span>
          </div>

          {/* Main headline - Large serif font */}
          <h1 className="mb-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-700 font-serif text-6xl font-bold text-gray-900 dark:text-white md:text-7xl lg:text-8xl text-balance">
            AI Chat With a Brain.
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mb-10 max-w-3xl animate-in fade-in-50 slide-in-from-bottom-5 delay-100 duration-700 text-xl text-gray-600 dark:text-gray-400 md:text-2xl">
            Upload your PDFs and have intelligent conversations with them. 
            Get instant answers with accurate citations.
          </p>

          {/* CTA Buttons */}
          <div className="mb-16 flex flex-col justify-center gap-4 animate-in fade-in-50 slide-in-from-bottom-6 delay-200 duration-700 sm:flex-row">
            <Button size="xl" variant="primary" asChild>
              <Link href="/sign-up">
                Try it Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="xl" variant="secondary" asChild>
              <Link href="/demo">
                Watch Demo
                <Play className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* Social proof */}
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Trusted by researchers, students, and professionals
          </p>
        </div>
      </MaxWidthWrapper>
    </section>
  );
};

export default HeroSection;