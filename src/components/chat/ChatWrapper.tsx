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
  RotateCw,
} from "lucide-react";

import { trpc } from "@/app/_trpc/client";
import { ChatContextProvider } from "./ChatContext";
import ChatInput from "./ChatInput";
import { buttonVariants, Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { MessageSkeleton } from "../ui/skeleton";
import dynamic from "next/dynamic";

const Messages = dynamic(() => import("./Messages"), {
  loading: () => (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <MessageSkeleton />
      <MessageSkeleton />
      <MessageSkeleton />
    </div>
  ),
});

import type { Citation } from "@/types/chat";

interface ChatWrapperProps {
  fileId: string;
  onCitationClick?: (payload: { fileId: string; page?: number; citation?: Citation }) => void;
}

export const ChatWrapper = memo(({ fileId, onCitationClick }: ChatWrapperProps) => {
  const utils = trpc.useUtils();
  const { data, isLoading, error } = trpc.getFileUploadStatus.useQuery(
    {
      fileId,
    },
    {
      refetchInterval: (data) =>
        data?.status === "SUCCESS" || data?.status === "FAILED" ? false : 500,
    },
  );

  const { mutate: retryProcessing } = trpc.retryUploadProcessing.useMutation({
    onSuccess: () => {
      utils.getFileUploadStatus.invalidate({ fileId });
    },
  });

  if (isLoading)
    return (
      <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-background">
        <div className="flex flex-1 flex-col gap-4 p-4">
          <MessageSkeleton />
          <MessageSkeleton />
          <MessageSkeleton />
          <MessageSkeleton />
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
                We couldn&apos;t process your PDF. This might be due to a complex file format or a temporary API issue.
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={() => retryProcessing({ fileId })} 
                  className="w-full"
                >
                  <RotateCw className="mr-2 h-4 w-4" />
                  Retry Processing
                </Button>
                <Link href="/dashboard" className={buttonVariants({ variant: "outline", className: "w-full" })}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );

  return (
    <ChatContextProvider fileId={fileId}>
      <div className="relative flex h-full flex-col bg-slate-50/50 dark:bg-zinc-950/50">
        {/* Header */}
        <div className="bg-white/40 dark:bg-zinc-900/40 sticky top-0 z-10 border-b border-white/20 dark:border-white/5 backdrop-blur-xl">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-md shadow-primary-500/20">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h1 className="text-sm font-bold text-foreground">Document Analysis</h1>
                    <div className="flex items-center space-x-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">AI Ready</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm border-white/20 text-[10px] font-semibold">
                  AI Assistant
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex flex-1 flex-col overflow-hidden min-h-0">
          <Messages fileId={fileId} onCitationClick={onCitationClick} />
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-transparent backdrop-blur-sm">
          <ChatInput />
        </div>
      </div>
    </ChatContextProvider>
  );
});

ChatWrapper.displayName = "ChatWrapper";
