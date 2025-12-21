import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { componentStyles } from "@/styles/design-system.config";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success" | "outline" | "destructive" | "default" | "link";
  size?: "sm" | "md" | "lg" | "xl" | "default" | "icon";
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          componentStyles.button.base,
          componentStyles.button.variants[variant as keyof typeof componentStyles.button.variants],
          componentStyles.button.sizes[size as keyof typeof componentStyles.button.sizes],
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button };
