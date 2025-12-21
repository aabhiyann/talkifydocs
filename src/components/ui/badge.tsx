import * as React from "react";
import { cn } from "@/lib/utils";
import { componentStyles } from "@/styles/design-system.config";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof componentStyles.badge.variants;
}

const badgeVariants = ({
  variant = "neutral",
  className = "",
}: {
  variant?: keyof typeof componentStyles.badge.variants;
  className?: string;
} = {}) => {
  return cn(
    componentStyles.badge.base,
    componentStyles.badge.variants[variant],
    className,
  );
};

function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={badgeVariants({ variant, className })}
      {...props}
    />
  );
}

export { Badge, badgeVariants };