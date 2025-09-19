import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

interface ModernCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "glass" | "gradient";
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  rounded?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
}

const variants = {
  default:
    "bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700",
  elevated:
    "bg-white dark:bg-secondary-800 shadow-medium border border-secondary-200 dark:border-secondary-700",
  glass:
    "glass bg-white/60 dark:bg-secondary-800/60 backdrop-blur-sm border border-primary-100/50 dark:border-primary-700/50",
  gradient:
    "bg-gradient-to-br from-white to-primary-50 dark:from-secondary-800 dark:to-primary-900/20 border border-primary-200/50 dark:border-primary-700/50",
};

const paddings = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
  xl: "p-10",
};

const rounded = {
  sm: "rounded-lg",
  md: "rounded-xl",
  lg: "rounded-2xl",
  xl: "rounded-3xl",
  "2xl": "rounded-[1.5rem]",
  "3xl": "rounded-[2rem]",
};

export function ModernCard({
  children,
  className,
  variant = "default",
  hover = true,
  padding = "md",
  rounded: roundedVariant = "lg",
}: ModernCardProps) {
  return (
    <div
      className={cn(
        "transition-all duration-300",
        variants[variant],
        paddings[padding],
        rounded[roundedVariant],
        hover && "hover:scale-[1.02] hover:shadow-lg",
        className
      )}
    >
      {children}
    </div>
  );
}

interface ModernCardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function ModernCardHeader({
  children,
  className,
}: ModernCardHeaderProps) {
  return <div className={cn("space-y-1.5 pb-4", className)}>{children}</div>;
}

interface ModernCardTitleProps {
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function ModernCardTitle({
  children,
  className,
  size = "md",
}: ModernCardTitleProps) {
  const sizeClasses = {
    sm: "text-heading-sm",
    md: "text-heading-md",
    lg: "text-heading-lg",
    xl: "text-heading-xl",
  };

  return (
    <h3
      className={cn(
        "font-semibold text-secondary-900 dark:text-secondary-100",
        sizeClasses[size],
        className
      )}
    >
      {children}
    </h3>
  );
}

interface ModernCardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export function ModernCardDescription({
  children,
  className,
}: ModernCardDescriptionProps) {
  return (
    <p
      className={cn(
        "text-body-sm text-secondary-600 dark:text-secondary-400",
        className
      )}
    >
      {children}
    </p>
  );
}

interface ModernCardContentProps {
  children: ReactNode;
  className?: string;
}

export function ModernCardContent({
  children,
  className,
}: ModernCardContentProps) {
  return <div className={cn("space-y-4", className)}>{children}</div>;
}

interface ModernCardFooterProps {
  children: ReactNode;
  className?: string;
}

export function ModernCardFooter({
  children,
  className,
}: ModernCardFooterProps) {
  return (
    <div className={cn("flex items-center pt-4", className)}>{children}</div>
  );
}
