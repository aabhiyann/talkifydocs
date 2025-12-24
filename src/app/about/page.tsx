import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { Brain, Shield, Zap, Users, Target, Award } from "lucide-react";
import { companyConfig } from "@/config/company";

export default function AboutPage() {
  const values = [
    {
      icon: Brain,
      title: "AI Innovation",
      description:
        "We leverage cutting-edge artificial intelligence to revolutionize how you interact with documents.",
    },
    {
      icon: Shield,
      title: "Security First",
      description:
        "Your documents are protected with enterprise-grade security and privacy measures.",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Get instant answers and insights from your documents in real-time.",
    },
    {
      icon: Users,
      title: "User-Centric",
      description: "We design every feature with our users' needs and feedback at the center.",
    },
    {
      icon: Target,
      title: "Precision",
      description: "Deliver accurate, contextual responses that help you make informed decisions.",
    },
    {
      icon: Award,
      title: "Excellence",
      description: "Committed to delivering the highest quality document analysis experience.",
    },
  ];

  // Use team from config if enabled, otherwise empty array
  const team = companyConfig.about.showTeam ? companyConfig.about.team : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-primary-50/30 dark:bg-black dark:bg-none">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 -z-10">
          <div className="from-primary-400/20 to-accent-400/20 absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r blur-3xl" />
        </div>

        <MaxWidthWrapper>
          <div className="text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-2 dark:border-primary-800 dark:bg-primary-900/20">
              <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                Portfolio Project
              </span>
            </div>
            <h1 className="text-display-lg mb-6 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              About TalkifyDocs
            </h1>
            <p className="text-body-lg mx-auto max-w-3xl leading-relaxed text-secondary-600 dark:text-gray-300">
              A portfolio project demonstrating full-stack development with modern AI integration. Built with Next.js, cutting-edge Large Language Models, LangChain, and Pinecone to showcase advanced RAG (Retrieval-Augmented Generation) implementation.
            </p>
          </div>
        </MaxWidthWrapper>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <MaxWidthWrapper>
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div>
              <h2 className="text-display-md mb-6 text-secondary-900 dark:text-white">
                Why I Built This
              </h2>
              <p className="text-body-lg mb-6 text-secondary-600 dark:text-gray-300">
                TalkifyDocs started as a learning project to explore RAG (Retrieval-Augmented Generation) systems and modern full-stack development. The goal was to build a production-ready application that demonstrates AI integration, vector databases, and scalable architecture patterns.
              </p>
              <p className="text-body-md text-secondary-600 dark:text-gray-300">
                Built in 2024, this project showcases end-to-end development: from document processing and embedding generation to real-time chat interfaces and subscription management. It&apos;s a demonstration of building AI-powered applications that are both functional and user-friendly.
              </p>
            </div>
            <div className="glass rounded-3xl p-8 dark:bg-zinc-950/50 dark:border-zinc-800">
              <h3 className="text-heading-lg mb-6 text-secondary-900 dark:text-white">
                Tech Stack
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-heading-md text-secondary-900 dark:text-white">
                      AI & ML
                    </h4>
                    <p className="text-body-sm text-secondary-600 dark:text-gray-200">
                      Next-Gen LLMs, RAG, LangChain, Pinecone DB
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-heading-md text-secondary-900 dark:text-white">
                      Frontend
                    </h4>
                    <p className="text-body-sm text-secondary-600 dark:text-gray-200">
                      Next.js 16, React, TypeScript, Tailwind CSS
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary-500 to-secondary-600">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-heading-md text-secondary-900 dark:text-white">
                      Backend & Infrastructure
                    </h4>
                    <p className="text-body-sm text-secondary-600 dark:text-gray-200">
                      tRPC, Prisma, PostgreSQL, Stripe, Clerk Auth
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MaxWidthWrapper>
      </section>

      {/* Values Section */}
      <section className="bg-gradient-to-b from-primary-50/30 to-white py-16 dark:from-black dark:to-black dark:bg-none">
        <MaxWidthWrapper>
          <div className="mb-16 text-center">
            <h2 className="text-display-md mb-6 text-secondary-900 dark:text-white">
              Key Features
            </h2>
            <p className="text-body-lg mx-auto max-w-2xl text-secondary-600 dark:text-gray-300">
              What makes TalkifyDocs a comprehensive full-stack project
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {values.map((value, index) => (
              <div
                key={index}
                className="glass rounded-2xl p-8 text-center transition-all duration-300 hover:scale-105 dark:bg-zinc-950/50 dark:border-zinc-800"
              >
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500">
                  <value.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-heading-lg mb-4 text-secondary-900 dark:text-white">
                  {value.title}
                </h3>
                <p className="text-body-md text-secondary-600 dark:text-gray-300">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </MaxWidthWrapper>
      </section>

      {/* Team Section */}
      {team.length > 0 && (
        <section className="py-16 dark:bg-black">
          <MaxWidthWrapper>
            <div className="mb-16 text-center">
              <h2 className="text-display-md mb-6 text-secondary-900 dark:text-white">
                Meet Our Team
              </h2>
              <p className="text-body-lg mx-auto max-w-2xl text-secondary-600 dark:text-gray-300">
                The passionate people behind TalkifyDocs
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {team.map((member, index) => (
                <div
                  key={index}
                  className="glass rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105 dark:bg-zinc-950/50 dark:border-zinc-800"
                >
                  <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500">
                    <span className="text-2xl font-bold text-white">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <h3 className="text-heading-md mb-2 text-secondary-900 dark:text-white">
                    {member.name}
                  </h3>
                  <p className="text-body-sm mb-3 font-medium text-primary-600 dark:text-primary-400">
                    {member.role}
                  </p>
                  <p className="text-body-sm text-secondary-600 dark:text-gray-300">
                    {member.bio}
                  </p>
                </div>
              ))}
            </div>
          </MaxWidthWrapper>
        </section>
      )}

      {/* Stats Section */}
      {(companyConfig.stats.documentsProcessed ||
        companyConfig.stats.activeUsers ||
        companyConfig.stats.uptime ||
        companyConfig.stats.support) && (
          <section className="bg-gradient-to-b from-white to-primary-50/30 py-16 dark:from-black dark:to-black dark:bg-none">
            <MaxWidthWrapper>
              <div className="mb-16 text-center">
                <h2 className="text-display-md mb-6 text-secondary-900 dark:text-white">
                  By the Numbers
                </h2>
                <p className="text-body-lg mx-auto max-w-2xl text-secondary-600 dark:text-gray-300">
                  Our impact in numbers
                </p>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                {companyConfig.stats.documentsProcessed && (
                  <div className="text-center">
                    <div className="text-display-lg mb-2 font-bold text-primary-600 dark:text-primary-400">
                      {companyConfig.stats.documentsProcessed}
                    </div>
                    <div className="text-body-md text-secondary-600 dark:text-gray-300">
                      Documents Processed
                    </div>
                  </div>
                )}
                {companyConfig.stats.activeUsers && (
                  <div className="text-center">
                    <div className="text-display-lg mb-2 font-bold text-accent-600 dark:text-accent-400">
                      {companyConfig.stats.activeUsers}
                    </div>
                    <div className="text-body-md text-secondary-600 dark:text-gray-300">
                      Active Users
                    </div>
                  </div>
                )}
                {companyConfig.stats.uptime && (
                  <div className="text-center">
                    <div className="text-display-lg mb-2 font-bold text-secondary-600 dark:text-gray-300">
                      {companyConfig.stats.uptime}
                    </div>
                    <div className="text-body-md text-secondary-600 dark:text-gray-300">Uptime</div>
                  </div>
                )}
                {companyConfig.stats.support && (
                  <div className="text-center">
                    <div className="text-display-lg mb-2 font-bold text-primary-600 dark:text-primary-400">
                      {companyConfig.stats.support}
                    </div>
                    <div className="text-body-md text-secondary-600 dark:text-gray-300">Support</div>
                  </div>
                )}
              </div>
            </MaxWidthWrapper>
          </section>
        )}
    </div>
  );
}
