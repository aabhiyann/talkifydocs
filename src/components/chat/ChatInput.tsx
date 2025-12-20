import React, { useContext, useRef, useState, useCallback, memo } from "react";
import { Send, Paperclip, Mic, MicOff, Loader2 } from "lucide-react";

import { ChatContext } from "./ChatContext";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

interface ChatInputProps {
  isDisabled?: boolean;
}

export const ChatInput = memo(({ isDisabled }: ChatInputProps) => {
  const { addMessage, handleInputChange, isLoading, message } = useContext(ChatContext);

  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addMessage();
      textareaRef.current?.focus();
    }
  }, [addMessage]);

  const handleVoiceToggle = useCallback(() => {
    setIsRecording((prev) => !prev);
    // Voice recording logic would go here
  }, []);

  const handleSendMessage = useCallback(() => {
    addMessage();
    textareaRef.current?.focus();
  }, [addMessage]);

  return (
    <div className="border-t border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto w-full max-w-4xl">
        <div className="relative">
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <Textarea
                placeholder="Ask anything about your document..."
                rows={1}
                ref={textareaRef}
                maxRows={6}
                autoFocus
                onChange={handleInputChange}
                value={message}
                onKeyDown={handleKeyDown}
                disabled={isDisabled}
                className="min-h-[52px] resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-20 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-600 dark:border-gray-700 dark:bg-gray-800"
              />

              {/* Action Buttons */}
              <div className="absolute bottom-2 right-2 flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleVoiceToggle}
                  className={`h-8 w-8 p-0 ${isRecording ? "text-red-500" : "text-gray-400 hover:text-gray-600"}`}
                  disabled={isDisabled}
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                  disabled={isDisabled}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>

                <Button
                  disabled={isLoading || isDisabled || !message.trim()}
                  size="sm"
                  onClick={handleSendMessage}
                  className="h-8 w-8 rounded-lg bg-primary-600 p-0 text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-700 hover:shadow-lg"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Helper Text */}
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span>{message.length}/2000</span>
          </div>
        </div>
      </div>
    </div>
  );
});

ChatInput.displayName = "ChatInput";

export default ChatInput;
