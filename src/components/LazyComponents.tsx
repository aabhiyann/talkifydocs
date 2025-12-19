import React, { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// Lazy load heavy components
export const LazyPdfRenderer = lazy(() => import("./PdfRenderer").then(m => ({ default: m.PdfRenderer })));
export const LazyPdfFullscreen = lazy(() => import("./PdfFullscreen"));
export const LazyBillingForm = lazy(() => import("./BillingForm").then(m => ({ default: m.BillingForm })));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
  </div>
);

// Higher-order component for lazy loading with suspense
export function withLazyLoading<T extends object>(
  Component: React.ComponentType<T>,
  fallback?: React.ComponentType,
) {
  return function LazyComponent(props: T) {
    return (
      <Suspense fallback={fallback ? React.createElement(fallback) : <LoadingSpinner />}>
        <Component {...props} />
      </Suspense>
    );
  };
}

// Pre-configured lazy components
export const PdfRendererWithSuspense = withLazyLoading(LazyPdfRenderer);
export const PdfFullscreenWithSuspense = withLazyLoading(LazyPdfFullscreen);
export const BillingFormWithSuspense = withLazyLoading(LazyBillingForm);
