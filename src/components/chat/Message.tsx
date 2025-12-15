import { cn } from "@/lib/utils";
import { ExtendedMessage } from "@/types/message";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import { forwardRef } from "react";
import { Icons } from "../Icons";

interface MessageProps {
  message: ExtendedMessage;
  isNextMessageSamePerson: boolean;
  onCitationClick?: (payload: {
    fileId: string;
    page?: number;
    citation?: any;
  }) => void;
}

const Message = forwardRef<HTMLDivElement, MessageProps>(
  ({ message, isNextMessageSamePerson, onCitationClick }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-end", {
          "justify-end": message.isUserMessage,
        })}
      >
        <div
          className={cn(
            "relative flex h-6 w-6 aspect-square items-center justify-center",
            {
              "order-2 bg-primary-600 rounded-sm": message.isUserMessage,
              "order-1 bg-gray-800 rounded-sm": !message.isUserMessage,
              invisible: isNextMessageSamePerson,
            }
          )}
        >
          {message.isUserMessage ? (
            <Icons.user className="fill-secondary-50 text-secondary-50 h-3/4 w-3/4" />
          ) : (
            <Icons.logo className="fill-gray-300 h-3/4 w-3/4" />
          )}
        </div>

        <div
          className={cn("flex flex-col space-y-2 text-base max-w-md mx-2", {
            "order-1 items-end": message.isUserMessage,
            "order-2 items-start": !message.isUserMessage,
          })}
        >
          <div
            className={cn("px-4 py-2 rounded-lg inline-block", {
              "bg-primary-600 text-secondary-50": message.isUserMessage,
              "bg-muted text-foreground": !message.isUserMessage,
              "rounded-br-none":
                !isNextMessageSamePerson && message.isUserMessage,
              "rounded-bl-none":
                !isNextMessageSamePerson && !message.isUserMessage,
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
            {Array.isArray((message as any).citations) &&
              (message as any).citations.length > 0 && (
                <div
                  className={cn(
                    "mt-2 text-xs flex flex-wrap gap-1",
                    message.isUserMessage
                      ? "text-primary-100"
                      : "text-gray-600 dark:text-gray-300"
                  )}
                >
                  <span className="font-medium mr-1 whitespace-nowrap">
                    Sources:
                  </span>
                  {(message as any).citations.map((c: any, idx: number) => {
                    if (!c) return null;
                    const page =
                      c.pageNumber ??
                      c.page ??
                      (typeof c.pageIndex === "number"
                        ? c.pageIndex + 1
                        : undefined);
                    const labelParts = [
                      c.filename || c.fileName || c.title,
                      page ? `p.${page}` : null,
                    ].filter(Boolean);
                    const label = labelParts.join(" ");

                    const handleClick = () => {
                      if (!onCitationClick) return;
                      const targetFileId =
                        c.fileId || c.file_id || (message as any).fileId;
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
                          "underline-offset-2 hover:underline rounded px-1 py-0.5",
                          !message.isUserMessage &&
                            "hover:bg-gray-100 dark:hover:bg-gray-800",
                          message.isUserMessage &&
                            "hover:bg-primary-700/60 text-primary-50"
                        )}
                      >
                        {label || `Source ${idx + 1}`}
                      </button>
                    );
                  })}
                </div>
              )}

            {message.id !== "loading-message" ? (
              <div
                className={cn("text-xs select-none mt-2 w-full text-right", {
                  "text-gray-500": !message.isUserMessage,
                  "text-primary-200": message.isUserMessage,
                })}
              >
                {format(new Date(message.createdAt), "HH:mm")}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
);

Message.displayName = "Message";

export default Message;
