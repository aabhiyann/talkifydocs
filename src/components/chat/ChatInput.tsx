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
    <form 
      onSubmit={handleSubmit} 
      className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4"
    >
      <div className="mx-auto w-full max-w-4xl">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            placeholder="Ask anything about your documents..."
            className={cn(
              componentStyles.input.base,
              componentStyles.input.focus,
              'flex-1 min-h-[80px] max-h-[200px] resize-none'
            )}
            disabled={isLoading || isDisabled}
            onKeyDown={handleKeyDown}
          />
          <button
            type="submit"
            disabled={isLoading || isDisabled || !message.trim()}
            className={cn(
              componentStyles.button.base,
              componentStyles.button.variants.primary,
              'px-4 self-end h-10', // Added h-10 to match design system base height but button is self-end
              (isLoading || isDisabled || !message.trim()) && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        
        {/* Helper Text */}
        <div className="mt-2 flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400 opacity-70">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span>{message.length}/2000</span>
        </div>
      </div>
    </form>
  );
});

ChatInput.displayName = "ChatInput";

export default ChatInput;