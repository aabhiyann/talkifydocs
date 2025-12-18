import { trpc } from "@/app/_trpc/client";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";
import { Loader2, MessageSquare, Bot, User, ArrowUp } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import Message from "./Message";
import { useContext, useEffect, useRef } from "react";
import { ChatContext } from "./ChatContext";
import { useIntersection } from "@mantine/hooks";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Citation } from "@/types/chat";

interface MessagesProps {
  fileId: string;
  onCitationClick?: (payload: { fileId: string; page?: number; citation?: Citation }) => void;
}

const Messages = ({ fileId, onCitationClick }: MessagesProps) => {
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

  const loadingMessage = {
    createdAt: new Date().toISOString(),
    id: "loading-message",
    isUserMessage: false,
    text: (
      <div className="flex items-center space-x-2 text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>AI is thinking...</span>
      </div>
    ),
  };

  const combinedMessages = [...(isAiThinking ? [loadingMessage] : []), ...(messages ?? [])];

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
          <div className="dark:bg-primary-900/20 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
            <MessageSquare className="h-8 w-8 text-primary-600" />
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
          // Find the previous user message for assistant messages
          const previousUserMessage = !message.isUserMessage
            ? (() => {
                for (let i = index - 1; i >= 0; i--) {
                  const prevMsg = combinedMessages[i];
                  if (prevMsg?.isUserMessage && typeof prevMsg.text === "string") {
                    return prevMsg.text;
                  }
                }
                return undefined;
              })()
            : undefined;

          return (
            <div
              key={message.id}
              ref={index === combinedMessages.length - 1 ? lastMessageRef : undefined}
              className={`flex ${message.isUserMessage ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex max-w-[80%] items-start space-x-3 ${
                  message.isUserMessage ? "flex-row-reverse space-x-reverse" : ""
                }`}
              >
                {/* Avatar */}
                <div
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                    message.isUserMessage
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  {message.isUserMessage ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>

                {/* Message Content - Wist Style */}
                <div className="max-w-[80%]">
                  <Message
                    message={message}
                    isNextMessageSamePerson={false}
                    onCitationClick={onCitationClick}
                    previousUserMessage={previousUserMessage}
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
};

export default Messages;
