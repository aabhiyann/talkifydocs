import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import {
  Brain,
  Shield,
  Zap,
  Search,
  FileText,
  MessageSquare,
  Download,
  Upload,
  Lock,
  Clock,
  Globe,
  BarChart3,
  Users,
  Settings,
  Smartphone,
} from "lucide-react";
import {
  ModernCard,
  ModernCardContent,
  ModernCardHeader,
  ModernCardTitle,
  ModernCardDescription,
} from "@/components/ui/modern-card";

export default function FeaturesPage() {
  const mainFeatures = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description:
        "Advanced artificial intelligence understands context and provides intelligent responses to your document questions.",
      details: [
        "Natural language processing",
        "Context-aware responses",
        "Multi-language support",
        "Continuous learning",
      ],
    },
    {
      icon: MessageSquare,
      title: "Conversational Interface",
      description:
        "Chat with your documents naturally. Ask questions, get summaries, and extract insights through simple conversation.",
      details: [
        "Real-time chat interface",
        "Question-answer format",
        "Follow-up questions",
        "Conversation history",
      ],
    },
    {
      icon: FileText,
      title: "Document Processing",
      description:
        "Upload and process various document formats with our advanced parsing and analysis engine.",
      details: [
        "PDF document support",
        "Text extraction",
        "Image processing",
        "Format preservation",
      ],
    },
    {
      icon: Search,
      title: "Smart Search",
      description:
        "Find specific information across your documents with intelligent search capabilities and semantic understanding.",
      details: [
        "Semantic search",
        "Keyword highlighting",
        "Cross-document search",
        "Search suggestions",
      ],
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description:
        "Your documents are protected with bank-level security, encryption, and privacy controls.",
      details: [
        "End-to-end encryption",
        "SOC 2 compliance",
        "Data privacy controls",
        "Secure cloud storage",
      ],
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description:
        "Get instant responses and insights from your documents with our optimized processing pipeline.",
      details: [
        "Real-time processing",
        "Optimized algorithms",
        "Cached responses",
        "Fast document indexing",
      ],
    },
  ];

  const additionalFeatures = [
    {
      icon: Download,
      title: "Export & Share",
      description:
        "Export conversations and insights in multiple formats for easy sharing and collaboration.",
    },
    {
      icon: Upload,
      title: "Bulk Upload",
      description:
        "Upload multiple documents at once and process them efficiently in batch operations.",
    },
    {
      icon: Lock,
      title: "Access Control",
      description: "Set permissions and access controls for your documents and team members.",
    },
    {
      icon: Clock,
      title: "Version History",
      description: "Track changes and maintain version history of your document interactions.",
    },
    {
      icon: Globe,
      title: "Multi-Language",
      description: "Support for documents and conversations in multiple languages worldwide.",
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "Get insights into your document usage patterns and interaction analytics.",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Share documents and collaborate with team members in real-time.",
    },
    {
      icon: Settings,
      title: "Customization",
      description: "Customize the interface and AI behavior to match your specific needs.",
    },
    {
      icon: Smartphone,
      title: "Mobile Ready",
      description: "Access and interact with your documents from any device, anywhere.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-primary-50/30 dark:from-secondary-900 dark:to-primary-950/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 -z-10">
          <div className="from-primary-400/20 to-accent-400/20 absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r blur-3xl" />
        </div>

        <MaxWidthWrapper>
          <div className="text-center">
            <h1 className="text-display-lg mb-6 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              Powerful Features
            </h1>
            <p className="text-body-lg mx-auto max-w-3xl leading-relaxed text-secondary-600 dark:text-secondary-300">
              Discover the comprehensive set of features that make TalkifyDocs the ultimate document
              analysis and conversation platform.
            </p>
          </div>
        </MaxWidthWrapper>
      </section>

      {/* Main Features Section */}
      <section className="py-16">
        <MaxWidthWrapper>
          <div className="mb-16 text-center">
            <h2 className="text-display-md mb-6 text-secondary-900 dark:text-secondary-100">
              Core Features
            </h2>
            <p className="text-body-lg mx-auto max-w-2xl text-secondary-600 dark:text-secondary-300">
              The essential features that power your document conversations
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {mainFeatures.map((feature, index) => (
              <ModernCard key={index} variant="glass" hover={true} className="h-full">
                <ModernCardHeader>
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <ModernCardTitle size="lg" className="mb-2">
                        {feature.title}
                      </ModernCardTitle>
                      <ModernCardDescription className="text-body-md">
                        {feature.description}
                      </ModernCardDescription>
                    </div>
                  </div>
                </ModernCardHeader>
                <ModernCardContent>
                  <ul className="space-y-2">
                    {feature.details.map((detail, detailIndex) => (
                      <li
                        key={detailIndex}
                        className="text-body-sm flex items-center gap-2 text-secondary-600 dark:text-secondary-400"
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-primary-500" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </ModernCardContent>
              </ModernCard>
            ))}
          </div>
        </MaxWidthWrapper>
      </section>

      {/* Additional Features Section */}
      <section className="bg-gradient-to-b from-primary-50/30 to-white py-16 dark:from-primary-950/30 dark:to-secondary-900">
        <MaxWidthWrapper>
          <div className="mb-16 text-center">
            <h2 className="text-display-md mb-6 text-secondary-900 dark:text-secondary-100">
              Additional Features
            </h2>
            <p className="text-body-lg mx-auto max-w-2xl text-secondary-600 dark:text-secondary-300">
              Everything you need for a complete document management experience
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {additionalFeatures.map((feature, index) => (
              <ModernCard key={index} variant="glass" hover={true} className="text-center">
                <ModernCardContent className="space-y-4">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <ModernCardTitle size="md" className="mb-2">
                      {feature.title}
                    </ModernCardTitle>
                    <ModernCardDescription>{feature.description}</ModernCardDescription>
                  </div>
                </ModernCardContent>
              </ModernCard>
            ))}
          </div>
        </MaxWidthWrapper>
      </section>

      {/* Feature Comparison */}
      <section className="py-16">
        <MaxWidthWrapper>
          <div className="mb-16 text-center">
            <h2 className="text-display-md mb-6 text-secondary-900 dark:text-secondary-100">
              Feature Comparison
            </h2>
            <p className="text-body-lg mx-auto max-w-2xl text-secondary-600 dark:text-secondary-300">
              See how TalkifyDocs compares to traditional document tools
            </p>
          </div>

          <div className="glass rounded-3xl p-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-secondary-200 dark:border-secondary-700">
                    <th className="text-heading-sm px-6 py-4 text-left text-secondary-900 dark:text-secondary-100">
                      Feature
                    </th>
                    <th className="text-heading-sm px-6 py-4 text-center text-primary-600 dark:text-primary-400">
                      TalkifyDocs
                    </th>
                    <th className="text-heading-sm px-6 py-4 text-center text-secondary-600 dark:text-secondary-400">
                      Traditional Tools
                    </th>
                  </tr>
                </thead>
                <tbody className="space-y-4">
                  <tr className="border-b border-secondary-100 dark:border-secondary-800">
                    <td className="text-body-md px-6 py-4 text-secondary-900 dark:text-secondary-100">
                      AI-Powered Analysis
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-primary-500">
                        <span className="text-sm text-white">✓</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-red-500">
                        <span className="text-sm text-white">✗</span>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-secondary-100 dark:border-secondary-800">
                    <td className="text-body-md px-6 py-4 text-secondary-900 dark:text-secondary-100">
                      Conversational Interface
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-primary-500">
                        <span className="text-sm text-white">✓</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-red-500">
                        <span className="text-sm text-white">✗</span>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-secondary-100 dark:border-secondary-800">
                    <td className="text-body-md px-6 py-4 text-secondary-900 dark:text-secondary-100">
                      Real-time Processing
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-primary-500">
                        <span className="text-sm text-white">✓</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500">
                        <span className="text-sm text-white">~</span>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-secondary-100 dark:border-secondary-800">
                    <td className="text-body-md px-6 py-4 text-secondary-900 dark:text-secondary-100">
                      Document Search
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-primary-500">
                        <span className="text-sm text-white">✓</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-primary-500">
                        <span className="text-sm text-white">✓</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-body-md px-6 py-4 text-secondary-900 dark:text-secondary-100">
                      Team Collaboration
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-primary-500">
                        <span className="text-sm text-white">✓</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-success-500">
                        <span className="text-sm text-white">✓</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </MaxWidthWrapper>
      </section>
    </div>
  );
}
