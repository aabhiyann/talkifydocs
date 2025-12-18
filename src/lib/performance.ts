// Performance monitoring utilities

interface InternalPerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

// Minimal type for Web Vitals metrics to avoid adding web-vitals package dependency
interface WebVitalMetric {
  id: string; // Unique identifier for the metric
  name: "FCP" | "LCP" | "CLS" | "FID" | "TTFB" | "INP"; // Metric name
  value: number; // Metric value
  delta: number; // Delta between the current and previous value
  entries: PerformanceEntry[]; // Array of performance entries relevant to the metric
  navigationType: "navigate" | "reload" | "back_forward" | "prerender"; // Navigation type
}

class PerformanceMonitor {
  private metrics: Map<string, InternalPerformanceMetric> = new Map();

  // Start timing a performance metric
  start(name: string): void {
    this.metrics.set(name, {
      name,
      startTime: performance.now(),
    });
  }

  // End timing a performance metric
  end(name: string): number | null {
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Performance metric "${name}" not found`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;

    // Log in development
    if (process.env.NODE_ENV === "development") {
      console.log(`⏱️  ${name}: ${duration.toFixed(2)}ms`);
    }

    // Remove from active metrics
    this.metrics.delete(name);

    return duration;
  }

  // Get all completed metrics
  getMetrics(): InternalPerformanceMetric[] {
    return Array.from(this.metrics.values()).filter((m) => m.duration !== undefined);
  }

  // Clear all metrics
  clear(): void {
    this.metrics.clear();
  }
}

// Global performance monitor instance
export const perfMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export function usePerformanceMonitor(name: string) {
  const start = () => perfMonitor.start(name);
  const end = () => perfMonitor.end(name);

  return { start, end };
}

// Higher-order function for API performance monitoring
export function withPerformanceMonitoring<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  operationName: string,
) {
  return async (...args: T): Promise<R> => {
    perfMonitor.start(operationName);
    try {
      const result = await fn(...args);
      perfMonitor.end(operationName);
      return result;
    } catch (error) {
      perfMonitor.end(operationName);
      throw error;
    }
  };
}

// Database query performance monitoring
export function monitorDbQuery<T>(queryName: string, queryFn: () => Promise<T>): Promise<T> {
  return withPerformanceMonitoring(queryFn, `db-query:${queryName}`)();
}

// API route performance monitoring
export function monitorApiRoute<T>(routeName: string, handler: () => Promise<T>): Promise<T> {
  return withPerformanceMonitoring(handler, `api-route:${routeName}`)();
}

// Component render performance monitoring
export function monitorComponentRender(componentName: string) {
  return {
    start: () => perfMonitor.start(`component-render:${componentName}`),
    end: () => perfMonitor.end(`component-render:${componentName}`),
  };
}

// Web Vitals monitoring
export function reportWebVitals(metric: WebVitalMetric) {
  if (process.env.NODE_ENV === "development") {
    console.log("Web Vitals:", metric);
  }

  // In production, you might want to send this to an analytics service
  if (process.env.NODE_ENV === "production") {
    // Example: Send to analytics service
    // analytics.track('web-vitals', metric);
  }
}
