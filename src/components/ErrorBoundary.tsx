"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";

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
    console.error("ErrorBoundary caught an error:", error, errorInfo);
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
        <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 p-8">
          <div className="flex items-center space-x-2 text-red-500">
            <AlertTriangle className="h-8 w-8" />
            <h2 className="text-xl font-semibold">Something went wrong</h2>
          </div>
          
          <p className="max-w-md text-center text-gray-600">
            We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
          </p>
          
          {process.env.NODE_ENV === "development" && this.state.error && (
            <details className="max-w-md rounded-md bg-gray-100 p-4 text-left">
              <summary className="cursor-pointer font-medium">Error Details</summary>
              <pre className="mt-2 text-sm text-red-600">
                {this.state.error.message}
                {this.state.error.stack}
              </pre>
            </details>
          )}
          
          <div className="flex space-x-2">
            <Button onClick={this.resetError} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
