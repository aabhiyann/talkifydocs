import * as React from "react";
import { cn } from "@/lib/utils";
import { componentStyles } from "@/styles/design-system.config";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        className={cn(
          componentStyles.input.base,
          componentStyles.input.focus,
          error && componentStyles.input.error,
          componentStyles.input.disabled,
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };