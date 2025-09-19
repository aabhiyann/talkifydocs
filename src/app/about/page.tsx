import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { Brain, Shield, Zap, Users, Target, Award } from "lucide-react";
import Image from "next/image";

export default function AboutPage() {
  const values = [
    {
      icon: Brain,
      title: "AI Innovation",
      description: "We leverage cutting-edge artificial intelligence to revolutionize how you interact with documents."
    },
    {
      icon: Shield,
      title: "Security First",
      description: "Your documents are protected with enterprise-grade security and privacy measures."
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Get instant answers and insights from your documents in real-time."
    },
    {
      icon: Users,
      title: "User-Centric",
      description: "We design every feature with our users' needs and feedback at the center."
    },
    {
      icon: Target,
      title: "Precision",
      description: "Deliver accurate, contextual responses that help you make informed decisions."
    },
    {
      icon: Award,
      title: "Excellence",
      description: "Committed to delivering the highest quality document analysis experience."
    }
  ];

  const team = [
    {
      name: "Sarah Chen",
      role: "CEO & Co-Founder",
      image: "/api/placeholder/300/300",
      bio: "Former AI researcher at Google with 10+ years in machine learning and document processing."
    },
    {
      name: "Marcus Rodriguez",
      role: "CTO & Co-Founder", 
      image: "/api/placeholder/300/300",
      bio: "Ex-Microsoft engineer specializing in scalable AI systems and natural language processing."
    },
    {
      name: "Dr. Emily Watson",
      role: "Head of AI Research",
      image: "/api/placeholder/300/300",
      bio: "PhD in Computer Science from Stanford, leading our AI model development and optimization."
    },
    {
      name: "David Kim",
      role: "Head of Product",
      image: "/api/placeholder/300/300",
      bio: "Former product manager at Adobe, focused on creating intuitive user experiences."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-primary-50/30 dark:from-secondary-900 dark:to-primary-950/30">
      {/* Hero Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary-400/20 to-accent-400/20 rounded-full blur-3xl" />
        </div>
        
        <MaxWidthWrapper>
          <div className="text-center">
            <h1 className="text-display-lg mb-6 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              About TalkifyDocs
            </h1>
            <p className="text-body-lg text-secondary-600 dark:text-secondary-300 max-w-3xl mx-auto leading-relaxed">
              We're on a mission to transform how people interact with documents through 
              the power of artificial intelligence, making information more accessible and actionable.
            </p>
          </div>
        </MaxWidthWrapper>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <MaxWidthWrapper>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-display-md mb-6 text-secondary-900 dark:text-secondary-100">
                Our Mission
              </h2>
              <p className="text-body-lg text-secondary-600 dark:text-secondary-300 mb-6">
                At TalkifyDocs, we believe that every document contains valuable insights waiting to be discovered. 
                Our mission is to make these insights instantly accessible through conversational AI, 
                empowering individuals and organizations to make better decisions faster.
              </p>
              <p className="text-body-md text-secondary-600 dark:text-secondary-300">
                Founded in 2024, we've built TalkifyDocs from the ground up with a focus on accuracy, 
                security, and user experience. Our team combines deep expertise in AI, machine learning, 
                and user interface design to create tools that truly understand your content.
              </p>
            </div>
            <div className="glass rounded-3xl p-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-heading-md text-secondary-900 dark:text-secondary-100">AI-Powered</h3>
                    <p className="text-body-sm text-secondary-600 dark:text-secondary-400">Advanced language models</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-heading-md text-secondary-900 dark:text-secondary-100">Secure</h3>
                    <p className="text-body-sm text-secondary-600 dark:text-secondary-400">Enterprise-grade security</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-secondary-500 to-secondary-600 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-heading-md text-secondary-900 dark:text-secondary-100">Fast</h3>
                    <p className="text-body-sm text-secondary-600 dark:text-secondary-400">Real-time processing</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MaxWidthWrapper>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gradient-to-b from-primary-50/30 to-white dark:from-primary-950/30 dark:to-secondary-900">
        <MaxWidthWrapper>
          <div className="text-center mb-16">
            <h2 className="text-display-md mb-6 text-secondary-900 dark:text-secondary-100">
              Our Values
            </h2>
            <p className="text-body-lg text-secondary-600 dark:text-secondary-300 max-w-2xl mx-auto">
              These core values guide everything we do at TalkifyDocs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="glass rounded-2xl p-8 text-center hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                  <value.icon className="w-8 h-8 text-white" />
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
          <div className="text-center mb-16">
            <h2 className="text-display-md mb-6 text-secondary-900 dark:text-secondary-100">
              Meet Our Team
            </h2>
            <p className="text-body-lg text-secondary-600 dark:text-secondary-300 max-w-2xl mx-auto">
              The passionate people behind TalkifyDocs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="glass rounded-2xl p-6 text-center hover:scale-105 transition-all duration-300">
                <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="text-heading-md mb-2 text-secondary-900 dark:text-secondary-100">
                  {member.name}
                </h3>
                <p className="text-body-sm text-primary-600 dark:text-primary-400 mb-3 font-medium">
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
      <section className="py-16 bg-gradient-to-b from-white to-primary-50/30 dark:from-secondary-900 dark:to-primary-950/30">
        <MaxWidthWrapper>
          <div className="text-center mb-16">
            <h2 className="text-display-md mb-6 text-secondary-900 dark:text-secondary-100">
              By the Numbers
            </h2>
            <p className="text-body-lg text-secondary-600 dark:text-secondary-300 max-w-2xl mx-auto">
              Our impact in numbers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-display-lg font-bold text-primary-600 dark:text-primary-400 mb-2">
                10K+
              </div>
              <div className="text-body-md text-secondary-600 dark:text-secondary-400">
                Documents Processed
              </div>
            </div>
            <div className="text-center">
              <div className="text-display-lg font-bold text-accent-600 dark:text-accent-400 mb-2">
                5K+
              </div>
              <div className="text-body-md text-secondary-600 dark:text-secondary-400">
                Active Users
              </div>
            </div>
            <div className="text-center">
              <div className="text-display-lg font-bold text-secondary-600 dark:text-secondary-400 mb-2">
                99.9%
              </div>
              <div className="text-body-md text-secondary-600 dark:text-secondary-400">
                Uptime
              </div>
            </div>
            <div className="text-center">
              <div className="text-display-lg font-bold text-primary-600 dark:text-primary-400 mb-2">
                24/7
              </div>
              <div className="text-body-md text-secondary-600 dark:text-secondary-400">
                Support
              </div>
            </div>
          </div>
        </MaxWidthWrapper>
      </section>
    </div>
  );
}
