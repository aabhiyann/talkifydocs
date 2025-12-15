"use client";

import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { captureException } from "@/lib/sentry";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
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
        return (
          <FallbackComponent
            error={this.state.error}
            resetError={this.resetError}
          />
        );
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="max-w-lg w-full bg-white shadow-xl rounded-xl p-8 text-center">
            <div className="flex flex-col items-center space-y-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>

              <div className="space-y-3">
                <h1 className="text-2xl font-bold text-foreground">
                  Oops! Something went wrong
                </h1>
                <p className="text-gray-600 leading-relaxed">
                  We&apos;re sorry, but something unexpected happened. Our team has
                  been notified and we&apos;re working to fix it.
                </p>
                {process.env.NODE_ENV === "development" && this.state.error && (
                  <details className="text-left text-sm text-gray-500 mt-4">
                    <summary className="cursor-pointer hover:text-gray-700 font-medium">
                      Technical Details
                    </summary>
                    <pre className="mt-3 p-3 bg-gray-50 rounded-lg text-xs overflow-auto border">
                      {this.state.error.message}
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Button
                  onClick={this.resetError}
                  variant="outline"
                  className="flex items-center justify-center space-x-2 flex-1"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  className="flex items-center justify-center space-x-2 flex-1"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh Page</span>
                </Button>
                <Link href="/" className="flex-1">
                  <Button
                    variant="secondary"
                    className="w-full flex items-center justify-center space-x-2"
                  >
                    <Home className="w-4 h-4" />
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
