"use client";

import { trpc } from "@/app/_trpc/client";
import ChatInput from "./ChatInput";
import Messages from "./Messages";
import {
  ChevronLeft,
  Loader2,
  XCircle,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { buttonVariants, Button } from "../ui/button";
import { ChatContextProvider } from "./ChatContext";
import { ChatMessageSkeleton, PdfViewerSkeleton } from "../ui/skeleton";
import { memo } from "react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";

interface ChatWrapperProps {
  fileId: string;
}

const ChatWrapper = memo(({ fileId }: ChatWrapperProps) => {
  const { data, isLoading } = trpc.getFileUploadStatus.useQuery(
    {
      fileId,
    },
    {
      refetchInterval: (data) =>
        data?.status === "SUCCESS" || data?.status === "FAILED" ? false : 500,
    }
  );

  if (isLoading)
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-background via-background to-background flex flex-col">
        <div className="flex-1 flex justify-center items-center flex-col">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
              </div>
              <h3 className="text-heading-md font-semibold text-foreground mb-2">
                Loading your document
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We&apos;re preparing your PDF for analysis...
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="p-4">
          <ChatInput isDisabled />
        </div>
      </div>
    );

  if (data?.status === "PROCESSING")
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-background via-background to-background flex flex-col">
        <div className="flex-1 flex justify-center items-center flex-col">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                <Clock className="h-8 w-8 text-yellow-600 animate-pulse" />
              </div>
              <h3 className="text-heading-md font-semibold text-foreground mb-2">
                Processing your document
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Our AI is analyzing your PDF content...
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Progress</span>
                  <span>~{Math.floor(Math.random() * 30) + 70}%</span>
                </div>
                <Progress
                  value={Math.floor(Math.random() * 30) + 70}
                  className="h-2"
                />
              </div>
              <Badge variant="secondary" className="mt-4">
                <Clock className="w-3 h-3 mr-1" />
                This may take a few moments
              </Badge>
            </CardContent>
          </Card>
        </div>
        <div className="p-4">
          <ChatInput isDisabled />
        </div>
      </div>
    );

  if (data?.status === "FAILED")
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-background via-background to-background flex flex-col">
        <div className="flex-1 flex justify-center items-center flex-col">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-heading-md font-semibold text-foreground mb-2">
                Processing failed
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We couldn&apos;t process your PDF. Please try uploading again.
              </p>
              <div className="space-y-3">
                <Link
                  href="/dashboard"
                  className={buttonVariants({ className: "w-full" })}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Link>
                <Button variant="outline" className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  Upload New Document
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );

  return (
    <ChatContextProvider fileId={fileId}>
      <div className="relative min-h-screen bg-gradient-to-br from-background via-background to-background flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Link
                  href="/dashboard"
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Link>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h1 className="font-semibold text-foreground">
                      Document
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Ready to chat
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Badge
                  variant="secondary"
                  className="flex items-center space-x-1"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Processed</span>
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-hidden">
            <Messages fileId={fileId} />
          </div>

          {/* Chat Input */}
          <div className="sticky bottom-0 bg-background/95 backdrop-blur-md border-t border-border p-4">
            <ChatInput />
          </div>
        </div>
      </div>
    </ChatContextProvider>
  );
});

ChatWrapper.displayName = "ChatWrapper";

export default ChatWrapper;
