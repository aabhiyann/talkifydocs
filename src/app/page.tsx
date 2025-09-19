import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import Link from "next/link";
import { ArrowRight, Sparkles, Zap, Shield, CheckCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import Image from "next/image";
import HeroSection from "@/components/HeroSection";

export default function Home() {
  return (
    <>
      <HeroSection />

      {/* Product Preview Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary-400/20 to-accent-400/20 rounded-full blur-3xl" />
        </div>
        
        <MaxWidthWrapper>
          <div className="text-center mb-16">
            <h2 className="text-display-lg mb-6 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              See TalkifyDocs in Action
            </h2>
            <p className="text-body-lg text-secondary-600 dark:text-secondary-300 max-w-2xl mx-auto">
              Experience the power of AI-driven document analysis with our intuitive interface
            </p>
          </div>

          <div className="relative">
            <div className="glass rounded-3xl p-2 shadow-dramatic">
              <div className="rounded-2xl overflow-hidden bg-white dark:bg-secondary-800">
                <Image
                  src="/dashboard-preview.jpg"
                  alt="TalkifyDocs Dashboard Preview"
                  width={1364}
                  height={866}
                  quality={90}
                  priority
                  className="w-full h-auto"
                />
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl rotate-12 opacity-80 animate-bounce-in delay-1000" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-accent-500 to-primary-500 rounded-xl -rotate-12 opacity-80 animate-bounce-in delay-1500" />
          </div>
        </MaxWidthWrapper>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gradient-to-b from-white to-primary-50/30 dark:from-secondary-900 dark:to-primary-950/30">
        <MaxWidthWrapper>
          <div className="text-center mb-16">
            <h2 className="text-display-lg mb-6 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-body-lg text-secondary-600 dark:text-secondary-300 max-w-2xl mx-auto">
              Get started with TalkifyDocs in three simple steps and unlock the power of AI-driven document analysis
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="group relative">
              <div className="glass rounded-2xl p-8 text-center hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-heading-lg mb-4 text-secondary-900 dark:text-secondary-100">
                  Create Account
                </h3>
                <p className="text-body-md text-secondary-600 dark:text-secondary-400 mb-4">
                  Sign up for a free account or upgrade to our{" "}
                  <Link
                    href="/pricing"
                    className="text-primary-600 hover:text-primary-700 font-medium underline underline-offset-2"
                  >
                    professional plan
                  </Link>
                  .
                </p>
              </div>
            </div>

            <div className="group relative">
              <div className="glass rounded-2xl p-8 text-center hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-heading-lg mb-4 text-secondary-900 dark:text-secondary-100">
                  Upload Document
                </h3>
                <p className="text-body-md text-secondary-600 dark:text-secondary-400">
                  Upload your PDF document and our AI will process it for intelligent analysis and understanding.
                </p>
              </div>
            </div>

            <div className="group relative">
              <div className="glass rounded-2xl p-8 text-center hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-secondary-500 to-secondary-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-heading-lg mb-4 text-secondary-900 dark:text-secondary-100">
                  Ask & Get Answers
                </h3>
                <p className="text-body-md text-secondary-600 dark:text-secondary-400">
                  Interact with your document through natural language queries and receive intelligent, contextual responses.
                </p>
              </div>
            </div>
          </div>

          {/* Upload Preview */}
          <div className="relative">
            <div className="glass rounded-3xl p-2 shadow-dramatic">
              <div className="rounded-2xl overflow-hidden bg-white dark:bg-secondary-800">
                <Image
                  src="/file-upload-preview.jpg"
                  alt="File Upload Preview"
                  width={1419}
                  height={732}
                  quality={90}
                  loading="lazy"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </MaxWidthWrapper>
      </section>
    </>
  );
}
