import Link from "next/link";
import Image from "next/image";
import { Sparkles } from "lucide-react";

import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { marketing } from "@/content/marketing";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center py-20 px-6">
        {/* Background pattern */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-medium text-primary-600">
                  Powered by GPT-4o & Claude 3.5
                </span>
              </div>

              {/* Headline - Large Serif! */}
              <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
                Chat With Your Documents.
              </h1>

              {/* Subheadline */}
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Upload PDFs and have intelligent conversations. 
                Get instant answers with accurate citations.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/dashboard" className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl font-medium shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-center">
                  Try Free →
                </Link>
                <Link href="/demo" className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 px-8 py-4 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 text-center">
                  Watch Demo
                </Link>
              </div>
            </div>

            {/* Right: Turtle Illustration (already exists!) */}
            <div className="relative">
              <div className="relative animate-float">
                <Image
                  src="/brand/illustrations/learning.png"
                  alt="AI assistant learning your documents"
                  width={600}
                  height={600}
                  priority
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Preview Section */}
      <section className="relative overflow-hidden py-24">
        <MaxWidthWrapper>
          <div className="mb-16 text-center">
            <h2 className="mb-6 font-serif text-4xl font-bold text-foreground">
              {marketing.home.previewTitle}
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              {marketing.home.previewDesc}
            </p>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-xl border border-border">
              <Image
                src="/dashboard-preview.jpg"
                alt="TalkifyDocs Dashboard Preview"
                width={1364}
                height={866}
                quality={90}
                priority
                className="h-auto w-full"
              />
            </div>
          </div>
        </MaxWidthWrapper>
      </section>

      {/* How It Works Section */}
      <section className="bg-secondary/50 py-24">
        <MaxWidthWrapper>
          <div className="mb-16 text-center">
            <h2 className="mb-6 font-serif text-4xl font-bold text-foreground">
              {marketing.home.howTitle}
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              {marketing.home.howDesc}
            </p>
          </div>

          {/* Steps */}
          <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="group relative">
              <Card className="bg-card p-8 text-center" hover={true}>
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <div className="relative mx-auto mb-6 h-32 w-32">
                  <Image
                    src="/brand/icons/icon-512.png"
                    alt="Create Account"
                    fill
                    className="object-contain"
                  />
                </div>
                <h3 className="mb-4 text-xl font-semibold text-foreground">Create Account</h3>
                <p className="mb-4 text-muted-foreground leading-relaxed">
                  Sign up for a free account and start analyzing documents immediately. Upgrade to
                  our{" "}
                  <Link href="/pricing" className="text-primary hover:underline">
                    professional plan
                  </Link>{" "}
                  for advanced features.
                </p>
              </div>
            </div>

            <div className="group relative">
              <Card className="bg-card p-8 text-center" hover={true}>
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <div className="relative mx-auto mb-6 h-32 w-32">
                  <Image
                    src="/brand/illustrations/upload-docs.png"
                    alt="Upload Document"
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <h3 className="mb-4 text-xl font-semibold text-foreground">Upload Document</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Simply drag and drop your PDF document. Our advanced AI will instantly process and
                  understand your content for intelligent analysis.
                </p>
              </div>
            </div>

            <div className="group relative">
              <Card className="bg-card p-8 text-center" hover={true}>
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <div className="relative mx-auto mb-6 h-32 w-32">
                  <Image
                    src="/brand/illustrations/learning.png"
                    alt="Ask & Get Answers"
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <h3 className="mb-4 text-xl font-semibold text-foreground">Ask & Get Answers</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Ask questions in natural language and get instant, accurate answers. Our AI
                  understands context and provides intelligent, relevant responses from your
                  documents.
                </p>
              </div>
            </div>
          </div>

          {/* Upload Preview */}
          <div className="relative">
            <div className="overflow-hidden rounded-xl border border-border">
              <Image
                src="/file-upload-preview.jpg"
                alt="File Upload Preview"
                width={1419}
                height={732}
                quality={90}
                loading="lazy"
                className="h-auto w-full"
              />
            </div>
          </div>
        </MaxWidthWrapper>
      </section>
    </>
  );
}
