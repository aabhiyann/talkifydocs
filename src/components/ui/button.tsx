import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { componentStyles } from "@/styles/design-system.config";

// Re-implementing buttonVariants logic to avoid breaking existing imports
const buttonVariants = ({
  variant = "default",
  size = "default",
  className = "",
}: {
  variant?: keyof typeof componentStyles.button.variants;
  size?: keyof typeof componentStyles.button.sizes;
  className?: string;
} = {}) => {
  return cn(
    componentStyles.button.base,
    componentStyles.button.variants[variant],
    componentStyles.button.sizes[size],
    className,
  );
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof componentStyles.button.variants;
  size?: keyof typeof componentStyles.button.sizes;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };