"use client";

import React from "react";
import Image from "next/image";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { captureException } from "@/lib/sentry";
import { logger } from "@/lib/logger";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error("ErrorBoundary caught an error:", { error, errorInfo });
    // Capture error in Sentry
    captureException(error, {
      component: "ErrorBoundary",
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
    });
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
          <div className="w-full max-w-lg rounded-xl bg-white dark:bg-gray-900 p-8 text-center shadow-xl">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative h-32 w-32">
                <Image
                  src="/brand/states/error.png"
                  alt="Something went wrong"
                  fill
                  className="object-contain"
                />
              </div>

              <div className="space-y-3">
                <h1 className="text-2xl font-bold text-foreground">Oops! Something went wrong</h1>
                <p className="leading-relaxed text-gray-600">
                  We&apos;re sorry, but something unexpected happened. Our team has been notified
                  and we&apos;re working to fix it.
                </p>
                {process.env.NODE_ENV === "development" && this.state.error && (
                  <details className="mt-4 text-left text-sm text-gray-500">
                    <summary className="cursor-pointer font-medium hover:text-gray-700">
                      Technical Details
                    </summary>
                    <pre className="mt-3 overflow-auto rounded-lg border bg-gray-50 p-3 text-xs">
                      {this.state.error.message}
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>

              <div className="flex w-full flex-col gap-3 sm:flex-row">
                <Button
                  onClick={this.resetError}
                  variant="outline"
                  className="flex flex-1 items-center justify-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Try Again</span>
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  className="flex flex-1 items-center justify-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh Page</span>
                </Button>
                <Link href="/" className="flex-1">
                  <Button
                    variant="secondary"
                    className="flex w-full items-center justify-center space-x-2"
                  >
                    <Home className="h-4 w-4" />
                    <span>Go Home</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
