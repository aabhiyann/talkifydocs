// Google Analytics tracking functions
declare global {
  interface Window {
    gtag?: (command: string, targetId: string | Date, config?: Record<string, any>) => void;
    dataLayer?: any[];
  }
}

export function trackPageView(url: string) {
  if (typeof window !== "undefined" && window.gtag && process.env.NEXT_PUBLIC_GA_ID) {
    window.gtag("config", process.env.NEXT_PUBLIC_GA_ID, {
      page_path: url,
    });
  }
}

export function trackEvent(action: string, category: string, label?: string, value?: number) {
  if (typeof window !== "undefined" && window.gtag && process.env.NEXT_PUBLIC_GA_ID) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}

export function trackConversion(conversionId: string, value?: number, currency: string = "USD") {
  if (typeof window !== "undefined" && window.gtag && process.env.NEXT_PUBLIC_GA_ID) {
    window.gtag("event", "conversion", {
      send_to: conversionId,
      value: value,
      currency: currency,
    });
  }
}

// Performance tracking
export function trackPerformance(metricName: string, value: number, unit: string = "ms") {
  if (typeof window !== "undefined" && window.gtag && process.env.NEXT_PUBLIC_GA_ID) {
    window.gtag("event", "timing_complete", {
      name: metricName,
      value: Math.round(value),
      event_category: "Performance",
    });
  }
}

// User engagement tracking
export function trackEngagement(action: string, details?: Record<string, any>) {
  trackEvent(action, "User Engagement", JSON.stringify(details));
}
