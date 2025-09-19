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
  Smartphone
} from "lucide-react";
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from "@/components/ui/modern-card";

export default function FeaturesPage() {
  const mainFeatures = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Advanced artificial intelligence understands context and provides intelligent responses to your document questions.",
      details: [
        "Natural language processing",
        "Context-aware responses", 
        "Multi-language support",
        "Continuous learning"
      ]
    },
    {
      icon: MessageSquare,
      title: "Conversational Interface",
      description: "Chat with your documents naturally. Ask questions, get summaries, and extract insights through simple conversation.",
      details: [
        "Real-time chat interface",
        "Question-answer format",
        "Follow-up questions",
        "Conversation history"
      ]
    },
    {
      icon: FileText,
      title: "Document Processing",
      description: "Upload and process various document formats with our advanced parsing and analysis engine.",
      details: [
        "PDF document support",
        "Text extraction",
        "Image processing",
        "Format preservation"
      ]
    },
    {
      icon: Search,
      title: "Smart Search",
      description: "Find specific information across your documents with intelligent search capabilities and semantic understanding.",
      details: [
        "Semantic search",
        "Keyword highlighting",
        "Cross-document search",
        "Search suggestions"
      ]
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Your documents are protected with bank-level security, encryption, and privacy controls.",
      details: [
        "End-to-end encryption",
        "SOC 2 compliance",
        "Data privacy controls",
        "Secure cloud storage"
      ]
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Get instant responses and insights from your documents with our optimized processing pipeline.",
      details: [
        "Real-time processing",
        "Optimized algorithms",
        "Cached responses",
        "Fast document indexing"
      ]
    }
  ];

  const additionalFeatures = [
    {
      icon: Download,
      title: "Export & Share",
      description: "Export conversations and insights in multiple formats for easy sharing and collaboration."
    },
    {
      icon: Upload,
      title: "Bulk Upload",
      description: "Upload multiple documents at once and process them efficiently in batch operations."
    },
    {
      icon: Lock,
      title: "Access Control",
      description: "Set permissions and access controls for your documents and team members."
    },
    {
      icon: Clock,
      title: "Version History",
      description: "Track changes and maintain version history of your document interactions."
    },
    {
      icon: Globe,
      title: "Multi-Language",
      description: "Support for documents and conversations in multiple languages worldwide."
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "Get insights into your document usage patterns and interaction analytics."
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Share documents and collaborate with team members in real-time."
    },
    {
      icon: Settings,
      title: "Customization",
      description: "Customize the interface and AI behavior to match your specific needs."
    },
    {
      icon: Smartphone,
      title: "Mobile Ready",
      description: "Access and interact with your documents from any device, anywhere."
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
              Powerful Features
            </h1>
            <p className="text-body-lg text-secondary-600 dark:text-secondary-300 max-w-3xl mx-auto leading-relaxed">
              Discover the comprehensive set of features that make TalkifyDocs the ultimate 
              document analysis and conversation platform.
            </p>
          </div>
        </MaxWidthWrapper>
      </section>

      {/* Main Features Section */}
      <section className="py-16">
        <MaxWidthWrapper>
          <div className="text-center mb-16">
            <h2 className="text-display-md mb-6 text-secondary-900 dark:text-secondary-100">
              Core Features
            </h2>
            <p className="text-body-lg text-secondary-600 dark:text-secondary-300 max-w-2xl mx-auto">
              The essential features that power your document conversations
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {mainFeatures.map((feature, index) => (
              <ModernCard key={index} variant="glass" hover={true} className="h-full">
                <ModernCardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-6 h-6 text-white" />
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
                      <li key={detailIndex} className="flex items-center gap-2 text-body-sm text-secondary-600 dark:text-secondary-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
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
      <section className="py-16 bg-gradient-to-b from-primary-50/30 to-white dark:from-primary-950/30 dark:to-secondary-900">
        <MaxWidthWrapper>
          <div className="text-center mb-16">
            <h2 className="text-display-md mb-6 text-secondary-900 dark:text-secondary-100">
              Additional Features
            </h2>
            <p className="text-body-lg text-secondary-600 dark:text-secondary-300 max-w-2xl mx-auto">
              Everything you need for a complete document management experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalFeatures.map((feature, index) => (
              <ModernCard key={index} variant="glass" hover={true} className="text-center">
                <ModernCardContent className="space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <ModernCardTitle size="md" className="mb-2">
                      {feature.title}
                    </ModernCardTitle>
                    <ModernCardDescription>
                      {feature.description}
                    </ModernCardDescription>
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
          <div className="text-center mb-16">
            <h2 className="text-display-md mb-6 text-secondary-900 dark:text-secondary-100">
              Feature Comparison
            </h2>
            <p className="text-body-lg text-secondary-600 dark:text-secondary-300 max-w-2xl mx-auto">
              See how TalkifyDocs compares to traditional document tools
            </p>
          </div>

          <div className="glass rounded-3xl p-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-secondary-200 dark:border-secondary-700">
                    <th className="text-left py-4 px-6 text-heading-sm text-secondary-900 dark:text-secondary-100">Feature</th>
                    <th className="text-center py-4 px-6 text-heading-sm text-primary-600 dark:text-primary-400">TalkifyDocs</th>
                    <th className="text-center py-4 px-6 text-heading-sm text-secondary-600 dark:text-secondary-400">Traditional Tools</th>
                  </tr>
                </thead>
                <tbody className="space-y-4">
                  <tr className="border-b border-secondary-100 dark:border-secondary-800">
                    <td className="py-4 px-6 text-body-md text-secondary-900 dark:text-secondary-100">AI-Powered Analysis</td>
                    <td className="py-4 px-6 text-center">
                      <div className="w-6 h-6 mx-auto rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="w-6 h-6 mx-auto rounded-full bg-red-500 flex items-center justify-center">
                        <span className="text-white text-sm">✗</span>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-secondary-100 dark:border-secondary-800">
                    <td className="py-4 px-6 text-body-md text-secondary-900 dark:text-secondary-100">Conversational Interface</td>
                    <td className="py-4 px-6 text-center">
                      <div className="w-6 h-6 mx-auto rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="w-6 h-6 mx-auto rounded-full bg-red-500 flex items-center justify-center">
                        <span className="text-white text-sm">✗</span>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-secondary-100 dark:border-secondary-800">
                    <td className="py-4 px-6 text-body-md text-secondary-900 dark:text-secondary-100">Real-time Processing</td>
                    <td className="py-4 px-6 text-center">
                      <div className="w-6 h-6 mx-auto rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="w-6 h-6 mx-auto rounded-full bg-yellow-500 flex items-center justify-center">
                        <span className="text-white text-sm">~</span>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-secondary-100 dark:border-secondary-800">
                    <td className="py-4 px-6 text-body-md text-secondary-900 dark:text-secondary-100">Document Search</td>
                    <td className="py-4 px-6 text-center">
                      <div className="w-6 h-6 mx-auto rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="w-6 h-6 mx-auto rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-body-md text-secondary-900 dark:text-secondary-100">Team Collaboration</td>
                    <td className="py-4 px-6 text-center">
                      <div className="w-6 h-6 mx-auto rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="w-6 h-6 mx-auto rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
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
