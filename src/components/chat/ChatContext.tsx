import { ReactNode, createContext, useRef, useState, useCallback, useMemo } from "react";
import { useToast } from "../ui/use-toast";
import { useMutation } from "@tanstack/react-query";
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

export const ChatContextProvider = ({ fileId, children }: Props) => {
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const utils = trpc.useContext();
  const { toast } = useToast();
  const backupMessage = useRef("");

  // Get message count for context
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

  const { mutate: sendMessage } = useMutation({
    mutationFn: async ({ message }: { message: string }) => {
      const response = await fetch("/api/message", {
        method: "POST",
        body: JSON.stringify({
          fileId,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      return response.body;
    },
    onMutate: async ({ message }) => {
      backupMessage.current = message;
      setMessage("");

      // Cancel any outgoing refetches
      await utils.getFileMessages.cancel();

      // Snapshot the previous value
      const previousMessages = utils.getFileMessages.getInfiniteData();

      // Optimistically update to the new value
      utils.getFileMessages.setInfiniteData({ fileId, limit: INFINITE_QUERY_LIMIT }, (old) => {
        if (!old) {
          return {
            pages: [],
            pageParams: [],
          };
        }

        let newPages = [...old.pages];
        let latestPage = newPages[0]!;

        latestPage.messages = [
          {
            createdAt: new Date().toISOString(),
            id: crypto.randomUUID(),
            text: message,
            isUserMessage: true,
          },
          ...latestPage.messages,
        ];

        newPages[0] = latestPage;

        return {
          ...old,
          pages: newPages,
        };
      });

      setIsLoading(true);

      return {
        previousMessages: previousMessages?.pages.flatMap((page) => page.messages) ?? [],
      };
    },
    onSuccess: async (stream) => {
      setIsLoading(false);

      if (!stream) {
        return toast({
          title: "There was a problem sending this message",
          description: "Please refresh this page and try again.",
          variant: "destructive",
        });
      }

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let done = false;

      // accumulated response
      let accResponse = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);

        accResponse += chunkValue;

        // append chunk to the last message
        utils.getFileMessages.setInfiniteData({ fileId, limit: INFINITE_QUERY_LIMIT }, (old) => {
          if (!old) return { pages: [], pageParams: [] };

          let isAiResponseCreated = false;
          const newPages = old.pages.map((page) => {
            if (isAiResponseCreated) return page;

            let updatedMessages = page.messages.map((message) => {
              if (message.id === "loading-message") {
                isAiResponseCreated = true;
                return {
                  ...message,
                  id: crypto.randomUUID(),
                  text: accResponse,
                  isUserMessage: false,
                };
              }
              return message;
            });

            if (!isAiResponseCreated) {
              isAiResponseCreated = true;
              updatedMessages = [
                {
                  createdAt: new Date().toISOString(),
                  id: crypto.randomUUID(),
                  text: accResponse,
                  isUserMessage: false,
                },
                ...updatedMessages,
              ];
            }

            return {
              ...page,
              messages: updatedMessages,
            };
          });

          return { ...old, pages: newPages };
        });
      }
    },
    onError: (_, __, context) => {
      setMessage(backupMessage.current);
      setIsLoading(false);

      // rollback to the previous value
      if (context?.previousMessages) {
        utils.getFileMessages.setInfiniteData({ fileId, limit: INFINITE_QUERY_LIMIT }, (old) => {
          if (!old) return { pages: [], pageParams: [] };

          return {
            ...old,
            pages: [
              {
                messages: context.previousMessages,
                nextCursor: undefined,
              },
              ...old.pages.slice(1),
            ],
          };
        });
      }

      return toast({
        title: "Error",
        description: "There was an error sending your message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addMessage = useCallback(() => {
    if (!canSendMessage) return;

    sendMessage({ message: message.trim() });
  }, [sendMessage, message, canSendMessage]);

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
