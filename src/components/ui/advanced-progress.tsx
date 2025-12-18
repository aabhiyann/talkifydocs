"use client";

import { cn } from "@/lib/utils";
import { CheckCircle, AlertCircle, Clock } from "lucide-react";

interface ProgressStep {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "in-progress" | "completed" | "error";
}

interface AdvancedProgressProps {
  steps: ProgressStep[];
  currentStep?: string;
  className?: string;
}

export function AdvancedProgress({ steps, currentStep, className }: AdvancedProgressProps) {
  const getStepIcon = (status: ProgressStep["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "in-progress":
        return (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        );
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStepStatus = (step: ProgressStep, index: number) => {
    if (step.status === "completed") return "completed";
    if (step.status === "error") return "error";
    if (step.status === "in-progress") return "in-progress";
    if (currentStep === step.id) return "in-progress";
    return "pending";
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="space-y-4">
        {steps.map((step, index) => {
          const status = getStepStatus(step, index);
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="relative">
              <div className="flex items-start space-x-4">
                {/* Step Icon */}
                <div className="flex-shrink-0">{getStepIcon(status as ProgressStep["status"])}</div>

                {/* Step Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <h3
                      className={cn(
                        "text-sm font-medium",
                        status === "completed" && "text-green-700",
                        status === "error" && "text-red-700",
                        status === "in-progress" && "text-blue-700",
                        status === "pending" && "text-gray-500",
                      )}
                    >
                      {step.title}
                    </h3>
                    {status === "in-progress" && (
                      <span className="inline-flex items-center rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                        In Progress
                      </span>
                    )}
                  </div>
                  {step.description && (
                    <p className="mt-1 text-sm text-gray-600">{step.description}</p>
                  )}
                </div>
              </div>

              {/* Connecting Line */}
              {!isLast && <div className="absolute left-2.5 top-8 h-6 w-px bg-gray-200" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  showPercentage?: boolean;
}

export function CircularProgress({
  value,
  max = 100,
  size = "md",
  className,
  showPercentage = true,
}: CircularProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = size === "sm" ? 20 : size === "md" ? 30 : 40;
  const strokeWidth = size === "sm" ? 3 : size === "md" ? 4 : 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        className="-rotate-90 transform"
        width={radius * 2 + strokeWidth * 2}
        height={radius * 2 + strokeWidth * 2}
      >
        {/* Background circle */}
        <circle
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="text-blue-500 transition-all duration-300 ease-in-out"
          strokeLinecap="round"
        />
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-medium text-gray-700">{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  );
}
