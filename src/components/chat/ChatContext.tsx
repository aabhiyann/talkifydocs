import { ReactNode, createContext, useRef, useState, useCallback, useMemo } from "react";
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

export const ChatContextProvider = ({ fileId, children }: Props) => {
  const [message, setMessage] = useState<string>("");
  const [lastSentMessage, setLastSentMessage] = useState<string>("");
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

  trpc.onSendMessage.useSubscription(
    { fileId, message: lastSentMessage },
    {
      onData: (data: any) => {
        const { chunk, isDone } = data;

        if (isDone) {
          setIsLoading(false);
          setLastSentMessage("");
          // Invalidate to get the final messages from DB (with correct IDs and citations if any)
          utils.getFileMessages.invalidate({ fileId });
          return;
        }

        utils.getFileMessages.setInfiniteData({ fileId, limit: INFINITE_QUERY_LIMIT }, (old) => {
          if (!old) return { pages: [], pageParams: [] };

          let isAiResponseCreated = false;
          const newPages = old.pages.map((page, index) => {
            if (index > 0) return page; // Only update the first page

            let updatedMessages = page.messages.map((message) => {
              if (message.id === "loading-message") {
                isAiResponseCreated = true;
                return {
                  ...message,
                  text: (message.text as string) + chunk,
                };
              }
              return message;
            });

            if (!isAiResponseCreated && index === 0) {
              isAiResponseCreated = true;
              updatedMessages = [
                {
                  createdAt: new Date().toISOString(),
                  id: "loading-message",
                  text: chunk,
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
      },
      onError: (err) => {
        setIsLoading(false);
        setLastSentMessage("");
        toast({
          title: "Error",
          description: "There was an error sending your message. Please try again.",
          variant: "destructive",
        });
      },
    }
  );

  const addMessage = useCallback(() => {
    if (!canSendMessage) return;
    
    const msgToSend = message.trim();
    setLastSentMessage(msgToSend);
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

  }, [canSendMessage, message, utils, fileId]);

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
