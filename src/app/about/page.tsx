import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { Brain, Shield, Zap, Users, Target, Award } from "lucide-react";

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

  const team = [
    {
      name: "Sarah Chen",
      role: "CEO & Co-Founder",
      image: "/api/placeholder/300/300",
      bio: "Former AI researcher at Google with 10+ years in machine learning and document processing.",
    },
    {
      name: "Marcus Rodriguez",
      role: "CTO & Co-Founder",
      image: "/api/placeholder/300/300",
      bio: "Ex-Microsoft engineer specializing in scalable AI systems and natural language processing.",
    },
    {
      name: "Dr. Emily Watson",
      role: "Head of AI Research",
      image: "/api/placeholder/300/300",
      bio: "PhD in Computer Science from Stanford, leading our AI model development and optimization.",
    },
    {
      name: "David Kim",
      role: "Head of Product",
      image: "/api/placeholder/300/300",
      bio: "Former product manager at Adobe, focused on creating intuitive user experiences.",
    },
  ];

  return (
    <div className="to-primary-50/30 dark:to-primary-950/30 min-h-screen bg-gradient-to-b from-white dark:from-secondary-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 -z-10">
          <div className="from-primary-400/20 to-accent-400/20 absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r blur-3xl" />
        </div>

        <MaxWidthWrapper>
          <div className="text-center">
            <h1 className="text-display-lg mb-6 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              About TalkifyDocs
            </h1>
            <p className="text-body-lg mx-auto max-w-3xl leading-relaxed text-secondary-600 dark:text-secondary-300">
              We&apos;re on a mission to transform how people interact with documents through the
              power of artificial intelligence, making information more accessible and actionable.
            </p>
          </div>
        </MaxWidthWrapper>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <MaxWidthWrapper>
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div>
              <h2 className="text-display-md mb-6 text-secondary-900 dark:text-secondary-100">
                Our Mission
              </h2>
              <p className="text-body-lg mb-6 text-secondary-600 dark:text-secondary-300">
                At TalkifyDocs, we believe that every document contains valuable insights waiting to
                be discovered. Our mission is to make these insights instantly accessible through
                conversational AI, empowering individuals and organizations to make better decisions
                faster.
              </p>
              <p className="text-body-md text-secondary-600 dark:text-secondary-300">
                Founded in 2024, we&apos;ve built TalkifyDocs from the ground up with a focus on
                accuracy, security, and user experience. Our team combines deep expertise in AI,
                machine learning, and user interface design to create tools that truly understand
                your content.
              </p>
            </div>
            <div className="glass rounded-3xl p-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-heading-md text-secondary-900 dark:text-secondary-100">
                      AI-Powered
                    </h3>
                    <p className="text-body-sm text-secondary-600 dark:text-secondary-400">
                      Advanced language models
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-heading-md text-secondary-900 dark:text-secondary-100">
                      Secure
                    </h3>
                    <p className="text-body-sm text-secondary-600 dark:text-secondary-400">
                      Enterprise-grade security
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary-500 to-secondary-600">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-heading-md text-secondary-900 dark:text-secondary-100">
                      Fast
                    </h3>
                    <p className="text-body-sm text-secondary-600 dark:text-secondary-400">
                      Real-time processing
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MaxWidthWrapper>
      </section>

      {/* Values Section */}
      <section className="from-primary-50/30 dark:from-primary-950/30 bg-gradient-to-b to-white py-16 dark:to-secondary-900">
        <MaxWidthWrapper>
          <div className="mb-16 text-center">
            <h2 className="text-display-md mb-6 text-secondary-900 dark:text-secondary-100">
              Our Values
            </h2>
            <p className="text-body-lg mx-auto max-w-2xl text-secondary-600 dark:text-secondary-300">
              These core values guide everything we do at TalkifyDocs
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {values.map((value, index) => (
              <div
                key={index}
                className="glass rounded-2xl p-8 text-center transition-all duration-300 hover:scale-105"
              >
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500">
                  <value.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-heading-lg mb-4 text-secondary-900 dark:text-secondary-100">
                  {value.title}
                </h3>
                <p className="text-body-md text-secondary-600 dark:text-secondary-400">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </MaxWidthWrapper>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <MaxWidthWrapper>
          <div className="mb-16 text-center">
            <h2 className="text-display-md mb-6 text-secondary-900 dark:text-secondary-100">
              Meet Our Team
            </h2>
            <p className="text-body-lg mx-auto max-w-2xl text-secondary-600 dark:text-secondary-300">
              The passionate people behind TalkifyDocs
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {team.map((member, index) => (
              <div
                key={index}
                className="glass rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105"
              >
                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500">
                  <span className="text-2xl font-bold text-white">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <h3 className="text-heading-md mb-2 text-secondary-900 dark:text-secondary-100">
                  {member.name}
                </h3>
                <p className="text-body-sm mb-3 font-medium text-primary-600 dark:text-primary-400">
                  {member.role}
                </p>
                <p className="text-body-sm text-secondary-600 dark:text-secondary-400">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </MaxWidthWrapper>
      </section>

      {/* Stats Section */}
      <section className="to-primary-50/30 dark:to-primary-950/30 bg-gradient-to-b from-white py-16 dark:from-secondary-900">
        <MaxWidthWrapper>
          <div className="mb-16 text-center">
            <h2 className="text-display-md mb-6 text-secondary-900 dark:text-secondary-100">
              By the Numbers
            </h2>
            <p className="text-body-lg mx-auto max-w-2xl text-secondary-600 dark:text-secondary-300">
              Our impact in numbers
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="text-display-lg mb-2 font-bold text-primary-600 dark:text-primary-400">
                10K+
              </div>
              <div className="text-body-md text-secondary-600 dark:text-secondary-400">
                Documents Processed
              </div>
            </div>
            <div className="text-center">
              <div className="text-display-lg mb-2 font-bold text-accent-600 dark:text-accent-400">
                5K+
              </div>
              <div className="text-body-md text-secondary-600 dark:text-secondary-400">
                Active Users
              </div>
            </div>
            <div className="text-center">
              <div className="text-display-lg mb-2 font-bold text-secondary-600 dark:text-secondary-400">
                99.9%
              </div>
              <div className="text-body-md text-secondary-600 dark:text-secondary-400">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-display-lg mb-2 font-bold text-primary-600 dark:text-primary-400">
                24/7
              </div>
              <div className="text-body-md text-secondary-600 dark:text-secondary-400">Support</div>
            </div>
          </div>
        </MaxWidthWrapper>
      </section>
    </div>
  );
}
