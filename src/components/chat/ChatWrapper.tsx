"use client";

import React, { memo } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Loader2,
  XCircle,
  FileText,
  CheckCircle2,
  Clock,
} from "lucide-react";

import { trpc } from "@/app/_trpc/client";
import { ChatContextProvider } from "./ChatContext";
import ChatInput from "./ChatInput";
import Messages from "./Messages";
import { buttonVariants, Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";

import type { Citation } from "@/types/chat";

interface ChatWrapperProps {
  fileId: string;
  onCitationClick?: (payload: { fileId: string; page?: number; citation?: Citation }) => void;
}

export const ChatWrapper = memo(({ fileId, onCitationClick }: ChatWrapperProps) => {
  const { data, isLoading, error } = trpc.getFileUploadStatus.useQuery(
    {
      fileId,
    },
    {
      refetchInterval: (data) =>
        data?.status === "SUCCESS" || data?.status === "FAILED" ? false : 500,
    },
  );

  if (isLoading)
    return (
      <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-background">
        <div className="flex flex-1 flex-col items-center justify-center">
          <Card className="mx-4 w-full max-w-md">
            <CardContent className="p-8 text-center">
              <div className="dark:bg-primary-900/20 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
              </div>
              <h3 className="text-heading-md mb-2 font-semibold text-foreground">
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
      <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-background">
        <div className="flex flex-1 flex-col items-center justify-center">
          <Card className="mx-4 w-full max-w-md">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                <Clock className="h-8 w-8 animate-pulse text-yellow-600" />
              </div>
              <h3 className="text-heading-md mb-2 font-semibold text-foreground">
                Processing your document
              </h3>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                Our AI is analyzing your PDF content...
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Progress</span>
                  <span>~{Math.floor(Math.random() * 30) + 70}%</span>
                </div>
                <Progress value={Math.floor(Math.random() * 30) + 70} className="h-2" />
              </div>
              <Badge variant="secondary" className="mt-4">
                <Clock className="mr-1 h-3 w-3" />
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
      <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-background">
        <div className="flex flex-1 flex-col items-center justify-center">
          <Card className="mx-4 w-full max-w-md">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-heading-md mb-2 font-semibold text-foreground">
                Processing failed
              </h3>
              <p className="mb-6 text-gray-600 dark:text-gray-400">
                We couldn&apos;t process your PDF. Please try uploading again.
              </p>
              <div className="space-y-3">
                <Link href="/dashboard" className={buttonVariants({ className: "w-full" })}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Link>
                <Button variant="outline" className="w-full">
                  <FileText className="mr-2 h-4 w-4" />
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
      <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-background">
        {/* Header */}
        <div className="bg-background/95 sticky top-0 z-10 border-b border-border backdrop-blur-md">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Link
                  href="/dashboard"
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Link>
                <div className="flex items-center space-x-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-600">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h1 className="font-semibold text-foreground">Document</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Ready to chat</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Processed</span>
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex flex-1 flex-col">
          <div className="flex-1 overflow-hidden">
            <Messages fileId={fileId} onCitationClick={onCitationClick} />
          </div>

          {/* Chat Input */}
          <div className="bg-background/95 sticky bottom-0 border-t border-border p-4 backdrop-blur-md">
            <ChatInput />
          </div>
        </div>
      </div>
    </ChatContextProvider>
  );
});

ChatWrapper.displayName = "ChatWrapper";

export default ChatWrapper;
