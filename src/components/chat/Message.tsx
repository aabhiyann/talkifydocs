import { cn } from "@/lib/utils";
import { ExtendedMessage } from "@/types/message";
import ReactMarkdown from "react-markdown";
import { formatDate } from "@/lib/utils/formatters";
import { forwardRef, memo } from "react";
import { User, Sparkles, Copy, Save } from "lucide-react";
import { componentStyles } from "@/styles/design-system.config";
import { trpc } from "@/app/_trpc/client";
import { useToast } from "../ui/use-toast";
import { Citation } from "@/types/chat";
import { Button } from "../ui/button";

interface MessageProps {
  message: ExtendedMessage;
  isNextMessageSamePerson: boolean;
  onCitationClick?: (payload: { fileId: string; page?: number; citation?: Citation }) => void;
  previousUserMessage?: string;
  fileId?: string;
}

const Message = memo(
  forwardRef<HTMLDivElement, MessageProps>(
    ({ message, isNextMessageSamePerson, onCitationClick, previousUserMessage, fileId }, ref) => {
      const { toast } = useToast();

      const { mutate: saveHighlight, isLoading: isSaving } = trpc.saveAsHighlight.useMutation({
        onSuccess: () => {
          toast({
            title: "Highlight saved",
            description: "This Q&A pair has been saved to your highlights",
          });
        },
        onError: (error) => {
          toast({
            title: "Error saving highlight",
            description: error.message,
            variant: "destructive",
          });
        },
      });

      const handleSaveHighlight = () => {
        if (!previousUserMessage || !fileId || typeof message.text !== "string") {
          toast({
            title: "Cannot save highlight",
            description: "Missing question or answer content",
            variant: "destructive",
          });
          return;
        }

        saveHighlight({
          question: previousUserMessage,
          answer: message.text,
          fileId,
          citations: message.citations,
        });
      };

      const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
          title: "Copied to clipboard",
          description: "Message content has been copied",
        });
      };

      const isUser = message.isUserMessage;

      return (
        <div
          ref={ref}
          className={cn(
            "flex flex-col",
            isUser ? "items-end" : "items-start"
          )}
        >
          <div
            className={cn(
              isUser 
                ? componentStyles.chatBubble.user 
                : componentStyles.chatBubble.assistant,
              "max-w-full group"
            )}
          >
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {typeof message.text === "string" ? (
                <ReactMarkdown
                  className={cn({
                    "text-white": isUser,
                  })}
                >
                  {message.text}
                </ReactMarkdown>
              ) : (
                message.text
              )}
            </div>

            {/* Citations */}
            {message.citations && message.citations.length > 0 && (
              <div className="mt-3 border-t border-white/10 pt-3 text-xs opacity-70 dark:border-gray-700">
                <span className="font-medium">Sources:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {message.citations.map((c, idx: number) => {
                    if (!c) return null;
                    const page = c.pageNumber;
                    const label = [c.fileName, page ? `p.${page}` : null]
                      .filter(Boolean)
                      .join(" ");

                    return (
                      <button
                        key={`${(c.fileId as string) || idx}-${page}`}
                        type="button"
                        onClick={() =>
                          onCitationClick?.({
                            fileId: c.fileId!,
                            page,
                            citation: c,
                          })
                        }
                        className="rounded px-1 py-0.5 underline-offset-2 hover:underline hover:bg-black/10 dark:hover:bg-white/10"
                      >
                        {label || `Source ${idx + 1}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            {!isUser && message.id !== "loading-message" && (
              <div className="mt-2 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => copyToClipboard(message.text as string)}
                  className="rounded p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                  title="Copy to clipboard"
                >
                  <Copy className="h-4 w-4" />
                </button>
                {previousUserMessage && fileId && typeof message.text === "string" && (
                  <button
                    onClick={handleSaveHighlight}
                    disabled={isSaving}
                    className="rounded p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                    title="Save as highlight"
                  >
                    <Save className={cn("h-4 w-4", isSaving && "animate-pulse")} />
                  </button>
                )}
                <span className="ml-auto select-none text-[10px] opacity-50">
                  {formatDate(message.createdAt, "HH:mm")}
                </span>
              </div>
            )}
            
            {isUser && (
              <div className="mt-1 select-none text-[10px] opacity-50 text-right">
                {formatDate(message.createdAt, "HH:mm")}
              </div>
            )}
          </div>
        </div>
      );
    }
  )
);

Message.displayName = "Message";

export default Message;
