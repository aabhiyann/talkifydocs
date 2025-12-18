import { cn } from "@/lib/utils";
import { ExtendedMessage } from "@/types/message";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import { forwardRef } from "react";
import { Icons } from "../Icons";
import { Button } from "../ui/button";
import { Save } from "lucide-react";
import { trpc } from "@/app/_trpc/client";
import { useToast } from "../ui/use-toast";

interface MessageProps {
  message: ExtendedMessage;
  isNextMessageSamePerson: boolean;
  onCitationClick?: (payload: { fileId: string; page?: number; citation?: any }) => void;
  previousUserMessage?: string;
  fileId?: string;
}

const Message = forwardRef<HTMLDivElement, MessageProps>(
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
        citations: Array.isArray((message as any).citations) ? (message as any).citations : undefined,
      });
    };

    return (
      <div
        ref={ref}
        className={cn("flex items-end", {
          "justify-end": message.isUserMessage,
        })}
      >
        <div
          className={cn("relative flex aspect-square h-6 w-6 items-center justify-center", {
            "order-2 rounded-sm bg-primary-600": message.isUserMessage,
            "order-1 rounded-sm bg-gray-800": !message.isUserMessage,
            invisible: isNextMessageSamePerson,
          })}
        >
          {message.isUserMessage ? (
            <Icons.user className="h-3/4 w-3/4 fill-secondary-50 text-secondary-50" />
          ) : (
            <Icons.logo className="h-3/4 w-3/4 fill-gray-300" />
          )}
        </div>

        <div
          className={cn("mx-2 flex max-w-md flex-col space-y-2 text-base", {
            "order-1 items-end": message.isUserMessage,
            "order-2 items-start": !message.isUserMessage,
          })}
        >
          <div
            className={cn("inline-block rounded-2xl px-4 py-3 shadow-sm", {
              "ml-auto bg-primary-600 text-white": message.isUserMessage,
              "mr-auto bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100":
                !message.isUserMessage,
              "rounded-tr-sm": message.isUserMessage,
              "rounded-tl-sm": !message.isUserMessage,
            })}
          >
            {typeof message.text === "string" ? (
              <ReactMarkdown
                className={cn("prose", {
                  "text-secondary-50": message.isUserMessage,
                })}
              >
                {message.text}
              </ReactMarkdown>
            ) : (
              message.text
            )}

            {/* Optional citations / sources */}
            {Array.isArray((message as any).citations) && (message as any).citations.length > 0 && (
              <div
                className={cn(
                  "mt-2 flex flex-wrap gap-1 text-xs",
                  message.isUserMessage ? "text-primary-100" : "text-gray-600 dark:text-gray-300",
                )}
              >
                <span className="mr-1 whitespace-nowrap font-medium">Sources:</span>
                {(message as any).citations.map((c: any, idx: number) => {
                  if (!c) return null;
                  const page =
                    c.pageNumber ??
                    c.page ??
                    (typeof c.pageIndex === "number" ? c.pageIndex + 1 : undefined);
                  const labelParts = [
                    c.filename || c.fileName || c.title,
                    page ? `p.${page}` : null,
                  ].filter(Boolean);
                  const label = labelParts.join(" ");

                  const handleClick = () => {
                    if (!onCitationClick) return;
                    const targetFileId = c.fileId || c.file_id || (message as any).fileId;
                    onCitationClick({
                      fileId: targetFileId,
                      page,
                      citation: c,
                    });
                  };

                  return (
                    <button
                      key={`${(c.id as string) || idx}`}
                      type="button"
                      onClick={handleClick}
                      className={cn(
                        "rounded px-1 py-0.5 underline-offset-2 hover:underline",
                        !message.isUserMessage && "hover:bg-gray-100 dark:hover:bg-gray-800",
                        message.isUserMessage && "hover:bg-primary-700/60 text-primary-50",
                      )}
                    >
                      {label || `Source ${idx + 1}`}
                    </button>
                  );
                })}
              </div>
            )}

            {message.id !== "loading-message" ? (
              <div className="mt-2 flex items-center justify-between">
                <div className="select-none text-xs">
                  {format(new Date(message.createdAt), "HH:mm")}
                </div>
                {!message.isUserMessage &&
                  previousUserMessage &&
                  fileId &&
                  typeof message.text === "string" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSaveHighlight}
                      disabled={isSaving}
                      className={cn(
                        "h-7 px-2 text-xs",
                        "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <Save className="mr-1 h-3 w-3" />
                      {isSaving ? "Saving..." : "Save"}
                    </Button>
                  )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  },
);

Message.displayName = "Message";

export default Message;
