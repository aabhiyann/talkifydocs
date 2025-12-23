import { ReactNode, createContext, useState, useCallback, useMemo } from "react";
import { useToast } from "../ui/use-toast";
import { trpc } from "@/app/_trpc/client";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";

type StreamResponse = {
  addMessage: () => void;
  message: string;
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
  clearMessage: () => void;
  canSendMessage: boolean;
  messageCount: number;
};

export const ChatContext = createContext<StreamResponse>({
  addMessage: () => {},
  message: "",
  handleInputChange: () => {},
  isLoading: false,
  clearMessage: () => {},
  canSendMessage: false,
  messageCount: 0,
});

interface Props {
  fileId: string;
  children: ReactNode;
}

type SubscriptionData = {
  chunk: string;
  isDone?: boolean;
};

export const ChatContextProvider = ({ fileId, children }: Props) => {
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const utils = trpc.useUtils();
  const { toast } = useToast();

  const { data: messagesData } = trpc.getFileMessages.useInfiniteQuery(
    {
      fileId,
      limit: INFINITE_QUERY_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage?.nextCursor,
      keepPreviousData: true,
    },
  );

  const messageCount = useMemo(() => {
    return messagesData?.pages.flatMap((page) => page.messages).length || 0;
  }, [messagesData]);

  const canSendMessage = useMemo(() => {
    return message.trim().length > 0 && !isLoading && message.length <= 2000;
  }, [message, isLoading]);

  const clearMessage = useCallback(() => {
    setMessage("");
  }, []);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    if (value.length <= 2000) {
      setMessage(value);
    }
  }, []);

  const addMessage = useCallback(async () => {
    if (!canSendMessage) return;
    
    const msgToSend = message.trim();
    setMessage("");
    setIsLoading(true);

    // Optimistically update the UI with the user message
    utils.getFileMessages.setInfiniteData({ fileId, limit: INFINITE_QUERY_LIMIT }, (old) => {
        if (!old) return { pages: [], pageParams: [] };

        const newPages = [...old.pages];
        const latestPage = { ...newPages[0] };

        latestPage.messages = [
            {
                createdAt: new Date().toISOString(),
                id: crypto.randomUUID(),
                text: msgToSend,
                isUserMessage: true,
            },
            ...latestPage.messages,
        ];

        newPages[0] = latestPage;

        return { ...old, pages: newPages };
    });

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileId,
          message: msgToSend,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      // Add placeholder for AI response
      utils.getFileMessages.setInfiniteData({ fileId, limit: INFINITE_QUERY_LIMIT }, (old) => {
        if (!old) return { pages: [], pageParams: [] };

        const newPages = [...old.pages];
        const latestPage = { ...newPages[0] };

        latestPage.messages = [
          {
            createdAt: new Date().toISOString(),
            id: "loading-message",
            text: "",
            isUserMessage: false,
          },
          ...latestPage.messages,
        ];

        newPages[0] = latestPage;
        return { ...old, pages: newPages };
      });

      let accResponse = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        accResponse += chunkValue;

        utils.getFileMessages.setInfiniteData({ fileId, limit: INFINITE_QUERY_LIMIT }, (old) => {
          if (!old) return { pages: [], pageParams: [] };

          const newPages = old.pages.map((page, index) => {
            if (index > 0) return page;

            const updatedMessages = page.messages.map((message) => {
              if (message.id === "loading-message") {
                return {
                  ...message,
                  text: accResponse,
                };
              }
              return message;
            });

            return { ...page, messages: updatedMessages };
          });

          return { ...old, pages: newPages };
        });
      }
      
      // Invalidate to get the final messages from DB
      utils.getFileMessages.invalidate({ fileId });

    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error sending your message. Please try again.",
        variant: "destructive",
      });
      
      // Remove the optimistic user message on error (optional, but good UX)
      utils.getFileMessages.setInfiniteData({ fileId, limit: INFINITE_QUERY_LIMIT }, (old) => {
         if (!old) return { pages: [], pageParams: [] };
         // Logic to remove the last added message could go here
         return old;
      });
    } finally {
      setIsLoading(false);
    }

  }, [canSendMessage, message, utils, fileId, toast]);

  const value = useMemo(
    () => ({
      addMessage,
      message,
      handleInputChange,
      isLoading,
      clearMessage,
      canSendMessage,
      messageCount,
    }),
    [addMessage, message, handleInputChange, isLoading, clearMessage, canSendMessage, messageCount],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
