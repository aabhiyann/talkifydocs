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
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const utils = trpc.useContext();
  const { toast } = useToast();
  const backupMessage = useRef("");

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
    { fileId, message },
    {
      onData: ({ chunk }) => {
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
                  text: (message.text as string) + chunk,
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
        toast({
          title: "Error",
          description: "There was an error sending your message. Please try again.",
          variant: "destructive",
        });
      },
      onComplete: () => {
        setIsLoading(false);
      },
    }
  );

  const addMessage = useCallback(() => {
    if (!canSendMessage) return;
    
    // Optimistically update the UI
    const previousMessages = utils.getFileMessages.getInfiniteData();
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
                text: message.trim(),
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

    setMessage("");
    setIsLoading(true);

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
