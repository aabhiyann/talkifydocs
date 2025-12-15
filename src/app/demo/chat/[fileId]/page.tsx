import { DEMO_DOCUMENTS, DEMO_CONVERSATIONS } from "@/lib/demo";
import PdfRenderer from "@/components/PdfRenderer";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface PageProps {
  params: {
    fileId: string;
  };
}

function DemoBanner() {
  return (
    <div className="bg-blue-50 dark:bg-blue-900/30 border-b border-blue-200 dark:border-blue-800 p-3 text-center text-sm text-blue-800 dark:text-blue-100">
      You&apos;re in demo mode.
      <Link href="/sign-up" className="font-medium text-blue-600 dark:text-blue-300 ml-1">
        Sign up free
      </Link>
      {" "}
      to upload your own PDFs and save your conversations.
    </div>
  );
}

export default function DemoChatPage({ params }: PageProps) {
  const file = DEMO_DOCUMENTS.find((d) => d.id === params.fileId);

  if (!file) notFound();

  const conversation = DEMO_CONVERSATIONS.find((c) => c.fileId === params.fileId);

  return (
    <div className="flex flex-col h-screen bg-background">
      <DemoBanner />
      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Left: PDF viewer */}
        <div className="w-full lg:w-1/2 border-b lg:border-b-0 lg:border-r border-border flex flex-col">
          <div className="flex-1 px-4 py-4 lg:px-6 lg:py-6">
            <PdfRenderer url={file.url} />
          </div>
        </div>

        {/* Right: Chat (read-only demo using preloaded messages) */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <div className="border-b p-4 bg-background/95 backdrop-blur-sm flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-lg">Demo Chat</h2>
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

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {conversation ? (
              conversation.messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                      m.role === "user"
                        ? "bg-primary-600 text-white"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <AlertCircle className="w-8 h-8 mb-2" />
                <p>No demo conversation available for this document yet.</p>
              </div>
            )}
          </div>

          <div className="border-t p-4 bg-background/95 backdrop-blur-sm text-center text-xs text-muted-foreground">
            Live chat is disabled in demo mode. Sign up to chat with your own
            documents.
          </div>
        </div>
      </div>
    </div>
  );
}
