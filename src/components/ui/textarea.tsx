import * as React from "react";
import TextareaAutosize, { TextareaAutosizeProps } from "react-textarea-autosize";

import { cn } from "@/lib/utils";
import { componentStyles } from "@/styles/design-system.config";

export interface TextareaProps extends TextareaAutosizeProps {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <TextareaAutosize
        className={cn(
          componentStyles.input.base,
          componentStyles.input.focus,
          error && componentStyles.input.error,
          componentStyles.input.disabled,
          "min-h-[80px] resize-y",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };