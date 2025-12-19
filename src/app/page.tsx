import Link from "next/link";
import Image from "next/image";

import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import HeroSection from "@/components/HeroSection";
import { marketing } from "@/content/marketing";

export default function Home() {
  return (
    <>
      <HeroSection />

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
              <div className="rounded-xl border border-border bg-card p-8 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="mb-4 text-xl font-semibold text-foreground">Create Account</h3>
                <p className="mb-4 text-muted-foreground">
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
              <div className="rounded-xl border border-border bg-card p-8 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="mb-4 text-xl font-semibold text-foreground">Upload Document</h3>
                <p className="text-muted-foreground">
                  Simply drag and drop your PDF document. Our advanced AI will instantly process and
                  understand your content for intelligent analysis.
                </p>
              </div>
            </div>

            <div className="group relative">
              <div className="rounded-xl border border-border bg-card p-8 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="mb-4 text-xl font-semibold text-foreground">Ask & Get Answers</h3>
                <p className="text-muted-foreground">
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
