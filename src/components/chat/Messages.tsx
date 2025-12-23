import React, { useContext, useEffect, useRef, memo, useMemo } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useIntersection } from "@mantine/hooks";
import { Loader2, MessageSquare, User, ArrowUp } from "lucide-react";

import { trpc } from "@/app/_trpc/client";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";
import Message from "./Message";
import { TurtleAvatar } from "./TurtleAvatar";
import { ChatContext } from "./ChatContext";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

import type { Citation } from "@/types/chat";
import type { ExtendedMessage } from "@/types/message";

interface MessagesProps {
  fileId: string;
  onCitationClick?: (payload: { fileId: string; page?: number; citation?: Citation }) => void;
}

type MessageWithContext = ExtendedMessage & {
  previousUserMessage?: string;
};

export const Messages = memo(({ fileId, onCitationClick }: MessagesProps) => {
  const { isLoading: isAiThinking } = useContext(ChatContext);

  const { data, isLoading, fetchNextPage } = trpc.getFileMessages.useInfiniteQuery(
    {
      fileId,
      limit: INFINITE_QUERY_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage?.nextCursor,
      keepPreviousData: true,
    },
  );

  const messages = data?.pages.flatMap((page) => page.messages);

  const combinedMessages = useMemo<MessageWithContext[]>(() => {
    const loadingMessage: MessageWithContext = {
      createdAt: new Date().toISOString(),
      id: `loading-message-${Date.now()}`,
      isUserMessage: false,
      text: (
        <div className="flex flex-col items-center space-y-3 py-4">
          <div className="relative h-24 w-24 animate-pulse">
            <Image
              src="/brand/states/processing.png"
              alt="AI is thinking"
              fill
              className="object-contain"
              sizes="96px"
            />
          </div>
          <span className="text-sm text-gray-500">AI is thinking...</span>
        </div>
      ),
    };

    const allMessages = [...(isAiThinking ? [loadingMessage] : []), ...(messages ?? [])];

    // Pre-calculate previous user message for highlights
    // Since allMessages is [newest...oldest], we iterate backwards
    let lastUserMsg = "";
    const withContext = [...allMessages].reverse().map((msg) => {
      const prevUserMsg = !msg.isUserMessage ? lastUserMsg : undefined;
      if (msg.isUserMessage && typeof msg.text === "string") {
        lastUserMsg = msg.text;
      }
      return { ...msg, previousUserMessage: prevUserMsg } as MessageWithContext;
    });

    return withContext.reverse();
  }, [messages, isAiThinking]);

  const lastMessageRef = useRef<HTMLDivElement>(null);

  const { ref, entry } = useIntersection({
    root: lastMessageRef.current,
    threshold: 1,
  });

  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage();
    }
  }, [entry, fetchNextPage]);

  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [combinedMessages.length]);

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <div className="mx-auto max-w-4xl space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/4 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (combinedMessages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="mx-auto max-w-md text-center">
          <div className="relative mx-auto mb-6 h-32 w-32">
            <Image
              src="/brand/states/empty-relaxing.png"
              alt="Start a conversation"
              fill
              className="object-contain"
              sizes="128px"
            />
          </div>
          <h3 className="text-heading-md mb-2 font-semibold text-foreground">
            Start a conversation
          </h3>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Ask questions about your document to get AI-powered insights and answers.
          </p>
          <div className="space-y-2">
            <p className="text-body-sm text-gray-500 dark:text-gray-400">Try asking:</p>
            <div className="space-y-1">
              <Badge variant="outline" className="mr-1">
                &quot;What is this document about?&quot;
              </Badge>
              <Badge variant="outline" className="mr-1">
                &quot;Summarize the key points&quot;
              </Badge>
              <Badge variant="outline" className="mr-1">
                &quot;Find information about...&quot;
              </Badge>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="mx-auto max-w-4xl space-y-4">
        {/* Load More Button */}
        {data?.pages[0]?.nextCursor && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchNextPage()}
              className="flex items-center space-x-2"
            >
              <ArrowUp className="h-4 w-4" />
              <span>Load earlier messages</span>
            </Button>
          </div>
        )}

        {/* Messages */}
        {combinedMessages.map((message, index) => {
          return (
            <div
              key={message.id}
              ref={index === combinedMessages.length - 1 ? lastMessageRef : undefined}
              className={`flex ${message.isUserMessage ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex max-w-[85%] items-start space-x-3 ${message.isUserMessage ? "flex-row-reverse space-x-reverse" : ""
                  }`}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
                    message.isUserMessage
                      ? "bg-primary-600 text-white"
                      : "bg-transparent"
                  )}
                >
                  {message.isUserMessage ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <TurtleAvatar
                      size="sm"
                      state={message.id === "loading-message" ? "thinking" : "neutral"}
                    />
                  )}
                </div>

                {/* Message Content - Wist Style */}
                <div className="max-w-[85%]">
                  <Message
                    message={message}
                    isNextMessageSamePerson={false}
                    onCitationClick={onCitationClick}
                    previousUserMessage={message.previousUserMessage}
                    fileId={fileId}
                  />
                </div>
              </div>
            </div>
          );
        })}

        {/* Intersection Observer */}
        <div ref={ref} className="h-4" />
      </div>
    </div>
  );
});

Messages.displayName = "Messages";

export default Messages;
