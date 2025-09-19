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

interface MessagesProps {
  fileId: string;
}

const Messages = ({ fileId }: MessagesProps) => {
  const { isLoading: isAiThinking } = useContext(ChatContext);

  const { data, isLoading, fetchNextPage } =
    trpc.getFileMessages.useInfiniteQuery(
      {
        fileId,
        limit: INFINITE_QUERY_LIMIT,
      },
      {
        getNextPageParam: (lastPage) => lastPage?.nextCursor,
        keepPreviousData: true,
      }
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

  const combinedMessages = [
    ...(isAiThinking ? [loadingMessage] : []),
    ...(messages ?? []),
  ];

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
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
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
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
            <MessageSquare className="h-8 w-8 text-primary-600" />
          </div>
          <h3 className="text-heading-md font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Start a conversation
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Ask questions about your document to get AI-powered insights and
            answers.
          </p>
          <div className="space-y-2">
            <p className="text-body-sm text-gray-500 dark:text-gray-400">
              Try asking:
            </p>
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
      <div className="max-w-4xl mx-auto space-y-4">
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
        {combinedMessages.map((message, index) => (
          <div
            key={message.id}
            ref={
              index === combinedMessages.length - 1 ? lastMessageRef : undefined
            }
            className={`flex ${
              message.isUserMessage ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`flex items-start space-x-3 max-w-[80%] ${
                message.isUserMessage ? "flex-row-reverse space-x-reverse" : ""
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.isUserMessage
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}
              >
                {message.isUserMessage ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>

              {/* Message Content */}
              <Card
                className={`${
                  message.isUserMessage
                    ? "bg-primary-600 text-white border-primary-600"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                }`}
              >
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium opacity-70">
                      {message.isUserMessage ? "You" : "AI Assistant"}
                    </div>
                    <div
                      className={`${
                        message.isUserMessage
                          ? "text-white"
                          : "text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      <Message
                        message={message}
                        isNextMessageSamePerson={false}
                      />
                    </div>
                    <div
                      className={`text-xs opacity-60 ${
                        message.isUserMessage
                          ? "text-white"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ))}

        {/* Intersection Observer */}
        <div ref={ref} className="h-4" />
      </div>
    </div>
  );
};

export default Messages;
