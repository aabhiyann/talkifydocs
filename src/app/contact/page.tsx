"use client";

import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  HelpCircle,
  Send,
  CheckCircle,
} from "lucide-react";
import {
  ModernCard,
  ModernCardContent,
  ModernCardHeader,
  ModernCardTitle,
  ModernCardDescription,
} from "@/components/ui/modern-card";

export default function ContactPage() {
  const contactMethods = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Get help via email within 24 hours",
      contact: "support@talkifydocs.com",
      action: "Send Email",
    },
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Chat with our support team in real-time",
      contact: "Available 9 AM - 6 PM EST",
      action: "Start Chat",
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our team",
      contact: "+1 (555) 123-4567",
      action: "Call Now",
    },
    {
      icon: HelpCircle,
      title: "Help Center",
      description: "Browse our comprehensive help articles",
      contact: "Self-service support",
      action: "Visit Help Center",
    },
  ];

  const faqs = [
    {
      question: "How do I get started with TalkifyDocs?",
      answer:
        "Simply sign up for a free account, upload your first PDF document, and start asking questions. Our AI will process your document and you can begin chatting with it immediately.",
    },
    {
      question: "What file formats are supported?",
      answer:
        "Currently, we support PDF documents. We're working on adding support for Word documents, PowerPoint presentations, and other formats in the coming months.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Yes, absolutely. We use enterprise-grade encryption, comply with SOC 2 standards, and never share your documents with third parties. Your data privacy is our top priority.",
    },
    {
      question: "Can I use TalkifyDocs for team collaboration?",
      answer:
        "Yes! Our Pro plan includes team features that allow you to share documents with team members, collaborate on conversations, and manage access permissions.",
    },
    {
      question: "What's the difference between Free and Pro plans?",
      answer:
        "The Free plan includes 5 pages per PDF and basic features. The Pro plan offers unlimited pages, advanced AI features, team collaboration, priority support, and more.",
    },
    {
      question: "How accurate are the AI responses?",
      answer:
        "Our AI provides highly accurate responses based on your document content. The accuracy depends on the quality and clarity of the source document, but we continuously improve our models.",
    },
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
              Get in Touch
            </h1>
            <p className="text-body-lg text-secondary-600 dark:text-secondary-300 max-w-3xl mx-auto leading-relaxed">
              We&apos;re here to help! Reach out to our support team or explore
              our resources to get the most out of TalkifyDocs.
            </p>
          </div>
        </MaxWidthWrapper>
      </section>

      {/* Contact Methods */}
      <section className="py-16">
        <MaxWidthWrapper>
          <div className="text-center mb-16">
            <h2 className="text-display-md mb-6 text-secondary-900 dark:text-secondary-100">
              Contact Methods
            </h2>
            <p className="text-body-lg text-secondary-600 dark:text-secondary-300 max-w-2xl mx-auto">
              Choose the way that works best for you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, index) => (
              <ModernCard
                key={index}
                variant="glass"
                hover={true}
                className="text-center"
              >
                <ModernCardContent className="space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                    <method.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <ModernCardTitle size="md" className="mb-2">
                      {method.title}
                    </ModernCardTitle>
                    <ModernCardDescription className="mb-3">
                      {method.description}
                    </ModernCardDescription>
                    <p className="text-body-sm text-primary-600 dark:text-primary-400 font-medium mb-4">
                      {method.contact}
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      {method.action}
                    </Button>
                  </div>
                </ModernCardContent>
              </ModernCard>
            ))}
          </div>
        </MaxWidthWrapper>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16 bg-gradient-to-b from-primary-50/30 to-white dark:from-primary-950/30 dark:to-secondary-900">
        <MaxWidthWrapper>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div>
              <h2 className="text-display-md mb-6 text-secondary-900 dark:text-secondary-100">
                Send us a Message
              </h2>
              <p className="text-body-lg text-secondary-600 dark:text-secondary-300 mb-8">
                Have a question or need help? Fill out the form below and
                we&apos;ll get back to you as soon as possible.
              </p>

              <ModernCard variant="glass" className="p-8">
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-body-sm font-medium text-secondary-900 dark:text-secondary-100 mb-2">
                        First Name
                      </label>
                      <Input placeholder="Enter your first name" />
                    </div>
                    <div>
                      <label className="block text-body-sm font-medium text-secondary-900 dark:text-secondary-100 mb-2">
                        Last Name
                      </label>
                      <Input placeholder="Enter your last name" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-body-sm font-medium text-secondary-900 dark:text-secondary-100 mb-2">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div>
                    <label className="block text-body-sm font-medium text-secondary-900 dark:text-secondary-100 mb-2">
                      Subject
                    </label>
                    <Input placeholder="What's this about?" />
                  </div>

                  <div>
                    <label className="block text-body-sm font-medium text-secondary-900 dark:text-secondary-100 mb-2">
                      Message
                    </label>
                    <Textarea
                      placeholder="Tell us how we can help you..."
                      rows={6}
                    />
                  </div>

                  <Button className="w-full bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700">
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </ModernCard>
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="text-display-md mb-6 text-secondary-900 dark:text-secondary-100">
                Office Information
              </h2>
              <p className="text-body-lg text-secondary-600 dark:text-secondary-300 mb-8">
                Visit us at our headquarters or reach out through any of these
                channels.
              </p>

              <div className="space-y-6">
                <ModernCard variant="glass" className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-heading-md text-secondary-900 dark:text-secondary-100 mb-1">
                        Address
                      </h3>
                      <p className="text-body-md text-secondary-600 dark:text-secondary-400">
                        123 Innovation Drive
                        <br />
                        San Francisco, CA 94105
                        <br />
                        United States
                      </p>
                    </div>
                  </div>
                </ModernCard>

                <ModernCard variant="glass" className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-heading-md text-secondary-900 dark:text-secondary-100 mb-1">
                        Business Hours
                      </h3>
                      <p className="text-body-md text-secondary-600 dark:text-secondary-400">
                        Monday - Friday: 9:00 AM - 6:00 PM EST
                        <br />
                        Saturday: 10:00 AM - 4:00 PM EST
                        <br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </ModernCard>

                <ModernCard variant="glass" className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary-500 to-secondary-600 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-heading-md text-secondary-900 dark:text-secondary-100 mb-1">
                        Response Time
                      </h3>
                      <p className="text-body-md text-secondary-600 dark:text-secondary-400">
                        Email: Within 24 hours
                        <br />
                        Live Chat: Immediate
                        <br />
                        Phone: Immediate during business hours
                      </p>
                    </div>
                  </div>
                </ModernCard>
              </div>
            </div>
          </div>
        </MaxWidthWrapper>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <MaxWidthWrapper>
          <div className="text-center mb-16">
            <h2 className="text-display-md mb-6 text-secondary-900 dark:text-secondary-100">
              Frequently Asked Questions
            </h2>
            <p className="text-body-lg text-secondary-600 dark:text-secondary-300 max-w-2xl mx-auto">
              Find answers to common questions about TalkifyDocs
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <ModernCard key={index} variant="glass" className="p-6">
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <h3 className="text-heading-md text-secondary-900 dark:text-secondary-100 group-open:text-primary-600 dark:group-open:text-primary-400">
                      {faq.question}
                    </h3>
                    <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center group-open:rotate-180 transition-transform duration-200">
                      <span className="text-primary-600 dark:text-primary-400 text-sm">
                        +
                      </span>
                    </div>
                  </summary>
                  <div className="mt-4 pt-4 border-t border-secondary-200 dark:border-secondary-700">
                    <p className="text-body-md text-secondary-600 dark:text-secondary-400">
                      {faq.answer}
                    </p>
                  </div>
                </details>
              </ModernCard>
            ))}
          </div>
        </MaxWidthWrapper>
      </section>
    </div>
  );
}
