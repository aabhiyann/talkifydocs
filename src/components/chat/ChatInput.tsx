import React, { useContext, useRef, useCallback, memo } from "react";
import { Send, Loader2 } from "lucide-react";

import { ChatContext } from "./ChatContext";
import { Textarea } from "../ui/textarea";
import { cn } from "@/lib/utils";
import { componentStyles } from "@/styles/design-system.config";

interface ChatInputProps {
  isDisabled?: boolean;
}

export const ChatInput = memo(({ isDisabled }: ChatInputProps) => {
  const { addMessage, handleInputChange, isLoading, message } = useContext(ChatContext);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (message.trim() && !isLoading && !isDisabled) {
      addMessage();
      textareaRef.current?.focus();
    }
  }, [addMessage, message, isLoading, isDisabled]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  return (
    <div className="w-full">
      <form 
        onSubmit={handleSubmit} 
        className="relative flex items-end gap-2 bg-white/30 dark:bg-zinc-900/30 backdrop-blur-2xl border border-white/30 dark:border-white/10 rounded-[24px] px-4 py-2 transition-all shadow-xl shadow-primary-500/5 focus-within:ring-1 focus-within:ring-primary-500/40"
      >
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleInputChange}
          placeholder="Ask a question..."
          rows={1}
          className="flex-1 min-h-[36px] max-h-[150px] py-2 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none text-sm placeholder:text-gray-500 dark:placeholder:text-gray-400"
          disabled={isLoading || isDisabled}
          onKeyDown={handleKeyDown}
        />
        <button
          type="submit"
          disabled={isLoading || isDisabled || !message.trim()}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300",
            message.trim() && !isLoading 
              ? "bg-primary-600 text-white shadow-md hover:scale-105 active:scale-95" 
              : "bg-gray-300 dark:bg-zinc-800 text-white/50 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
      <div className="mt-1.5 px-4 flex justify-end">
        <span className="text-[10px] text-gray-400 dark:text-zinc-500 tabular-nums font-medium">
          {message.length} / 2000
        </span>
      </div>
    </div>
  );
});

ChatInput.displayName = "ChatInput";

export default ChatInput;