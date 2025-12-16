import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface PageProps {
  params: {
    token: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const conversation = await db.conversation.findUnique({
    where: { shareToken: params.token },
    include: {
      conversationFiles: {
        include: {
          file: true,
        },
      },
    },
  });

  if (!conversation || !conversation.isPublic) {
    return {
      title: "Shared Conversation Not Found | TalkifyDocs",
    };
  }

  const fileNames = conversation.conversationFiles.map((cf) => cf.file.name).join(", ");

  return {
    title: `Shared Conversation: ${conversation.title} | TalkifyDocs`,
    description: `Shared conversation about: ${fileNames}`,
  };
}

export default async function SharedChatPage({ params }: PageProps) {
  const conversation = await db.conversation.findUnique({
    where: { shareToken: params.token },
    include: {
      conversationFiles: {
        include: {
          file: true,
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!conversation || !conversation.isPublic) {
    notFound();
  }

  const fileNames = conversation.conversationFiles.map((cf) => cf.file.name).join(", ");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-display-lg mb-2 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text font-bold text-transparent">
                Shared Conversation
              </h1>
              <p className="text-body-lg text-gray-600 dark:text-gray-300">{conversation.title}</p>
            </div>
            <Link href="/sign-up">
              <Button variant="outline" size="sm">
                Try TalkifyDocs
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div>
              <strong>Documents:</strong> {fileNames}
            </div>
            <div>
              <strong>Messages:</strong> {conversation.messages.length}
            </div>
            <div>
              <strong>Created:</strong> {format(new Date(conversation.createdAt), "MMMM d, yyyy")}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-4">
          {conversation.messages.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">This conversation has no messages yet.</p>
              </CardContent>
            </Card>
          ) : (
            conversation.messages.map((message, index) => {
              const citations = Array.isArray(message.citations)
                ? message.citations
                : message.citations
                  ? [message.citations]
                  : [];

              return (
                <Card
                  key={message.id}
                  className={
                    message.isUserMessage
                      ? "dark:bg-primary-950/20 border-primary-200 bg-primary-50 dark:border-primary-800"
                      : ""
                  }
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                          message.isUserMessage
                            ? "bg-primary-600 text-white"
                            : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {message.isUserMessage ? "👤" : "🤖"}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="font-semibold">
                            {message.isUserMessage ? "You" : "AI Assistant"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(message.createdAt), "h:mm a")}
                          </span>
                        </div>

                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown>{message.text}</ReactMarkdown>
                        </div>

                        {/* Citations */}
                        {citations.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="text-xs font-medium text-muted-foreground">
                              Sources:
                            </span>
                            {citations.map((c: any, idx: number) => {
                              const page =
                                c.pageNumber ??
                                c.page ??
                                (typeof c.pageIndex === "number" ? c.pageIndex + 1 : undefined);
                              const filename = c.filename || c.fileName || c.title || "Document";
                              return (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {filename}
                                  {page && ` (p.${page})`}
                                </Badge>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* CTA Footer */}
        <div className="mt-12 text-center">
          <Card className="dark:bg-primary-950/20 border-primary-200 bg-primary-50 dark:border-primary-800">
            <CardContent className="p-8">
              <h3 className="mb-2 text-xl font-semibold">
                Want to try TalkifyDocs with your own documents?
              </h3>
              <p className="mb-6 text-muted-foreground">
                Upload your PDFs and chat with AI-powered insights. Free to get started.
              </p>
              <Link href="/sign-up">
                <Button size="lg" className="bg-primary-600 hover:bg-primary-700">
                  Sign up for free
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
