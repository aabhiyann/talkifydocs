import * as React from "react";
import { cn } from "@/lib/utils";
import { componentStyles } from "@/styles/design-system.config";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(componentStyles.skeleton.base, className)}
      {...props}
    />
  );
}

export function DocumentCardSkeleton() {
  return (
    <div className={componentStyles.documentCard.container}>
      <div className={componentStyles.documentCard.thumbnail}>
        <Skeleton className="h-full w-full" />
      </div>
      <div className={componentStyles.documentCard.content}>
        <Skeleton className="mb-2 h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

export function MessageSkeleton() {
  return (
    <div className="flex gap-3 px-4 py-2">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

// Keeping for backward compatibility
export { MessageSkeleton as ChatMessageSkeleton };

export function PdfViewerSkeleton() {
  return (
    <div className="flex-1 p-4">
      <div className="flex h-full w-full items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
        <div className="space-y-4 text-center">
          <Skeleton className="mx-auto h-12 w-12 rounded-full" />
          <Skeleton className="mx-auto h-4 w-32" />
          <Skeleton className="mx-auto h-3 w-24" />
        </div>
      </div>
    </div>
  );
}