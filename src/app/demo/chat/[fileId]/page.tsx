import { DEMO_DOCUMENTS, DEMO_CONVERSATIONS } from "@/lib/demo";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import AsyncPdfRenderer from "@/components/AsyncPdfRenderer";
import { ChatWrapper } from "@/components/chat/ChatWrapper";

interface PageProps {
  params: {
    fileId: string;
  };
}

function DemoBanner() {
  return (
    <div className="border-b border-blue-200 bg-blue-50 p-3 text-center text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-100">
      You&apos;re in demo mode.
      <Link href="/sign-up" className="ml-1 font-medium text-blue-600 dark:text-blue-300">
        Sign up free
      </Link>{" "}
      to upload your own PDFs and save your conversations.
    </div>
  );
}

export default function DemoChatPage({ params }: PageProps) {
  const file = DEMO_DOCUMENTS.find((d) => d.id === params.fileId);

  if (!file) notFound();

  const conversation = DEMO_CONVERSATIONS.find((c) => c.fileId === params.fileId);

  return (
    <div className="flex h-screen flex-col bg-background">
      <DemoBanner />
      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Left: PDF viewer */}
        <div className="flex w-full flex-col border-b border-border lg:w-1/2 lg:border-b-0 lg:border-r">
          <div className="relative h-full w-full">
            <AsyncPdfRenderer url={file.url} />
          </div>
        </div>

        {/* Right: Chat (read-only demo using preloaded messages) */}
        <div className="flex w-full flex-col lg:w-1/2">
          <div className="bg-background/95 flex items-center justify-between border-b p-4 backdrop-blur-sm">
            <div>
              <h2 className="text-lg font-semibold">Demo Chat</h2>
              <p className="text-xs text-muted-foreground">
                Responses are based on a fixed demo conversation.
              </p>
            </div>
            <Link href="/demo">
              <Button variant="outline" size="sm">
                Back to Demo Docs
              </Button>
            </Link>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {conversation ? (
              conversation.messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                      m.role === "user" ? "bg-primary-600 text-white" : "bg-muted text-foreground"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                <AlertCircle className="mb-2 h-8 w-8" />
                <p>No demo conversation available for this document yet.</p>
              </div>
            )}
          </div>

          <div className="bg-background/95 border-t p-4 text-center text-xs text-muted-foreground backdrop-blur-sm">
            Live chat is disabled in demo mode. Sign up to chat with your own documents.
          </div>
        </div>
      </div>
    </div>
  );
}
