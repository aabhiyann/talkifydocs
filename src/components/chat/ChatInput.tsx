import { Send, Paperclip, Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useContext, useRef, useState } from "react";
import { ChatContext } from "./ChatContext";
import { Card } from "../ui/card";

interface ChatInputProps {
  isDisabled?: boolean;
}

const ChatInput = ({ isDisabled }: ChatInputProps) => {
  const { addMessage, handleInputChange, isLoading, message } =
    useContext(ChatContext);

  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addMessage();
      textareaRef.current?.focus();
    }
  };

  const handleVoiceToggle = () => {
    setIsRecording(!isRecording);
    // Voice recording logic would go here
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
      <div className="w-full max-w-4xl mx-auto">
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
                className="resize-none pr-20 text-base py-3 min-h-[52px] bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-primary-600 placeholder:text-gray-400"
              />
              
              {/* Action Buttons */}
              <div className="absolute bottom-2 right-2 flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleVoiceToggle}
                  className={`h-8 w-8 p-0 ${isRecording ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'}`}
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
                  onClick={() => {
                    addMessage();
                    textareaRef.current?.focus();
                  }}
                  className="h-8 w-8 p-0 bg-primary-600 hover:bg-primary-700 text-white rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
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
};

export default ChatInput;