"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { RefreshCw, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { logger } from "@/lib/logger";
import { formatBytes } from "@/lib/utils/formatters";

interface PdfDebuggerProps {
  url: string;
}

const PdfDebugger = ({ url }: PdfDebuggerProps) => {
  const [debugInfo, setDebugInfo] = useState<{
    url: string;
    fileExists: boolean;
    contentType: string;
    fileSize: number;
    pdfjsLoaded: boolean;
    workerConfigured: boolean;
    error: string | null;
  }>({
    url,
    fileExists: false,
    contentType: "",
    fileSize: 0,
    pdfjsLoaded: false,
    workerConfigured: false,
    error: null,
  });

  const [isChecking, setIsChecking] = useState(false);

  const runDiagnostics = useCallback(async () => {
    setIsChecking(true);
    setDebugInfo((prev) => ({ ...prev, error: null }));

    try {
      // Check if file is accessible
      const response = await fetch(url, { method: "HEAD" });
      const fileExists = response.ok;
      const contentType = response.headers.get("content-type") || "";
      const contentLength = response.headers.get("content-length");

      // Check if PDF.js can be loaded
      let pdfjsLoaded = false;
      let workerConfigured = false;

      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjsLoaded = true;
        workerConfigured = !!pdfjs.GlobalWorkerOptions.workerSrc;
      } catch (error) {
        logger.error("PDF.js load error:", error);
      }

      setDebugInfo({
        url,
        fileExists,
        contentType,
        fileSize: contentLength ? parseInt(contentLength) : 0,
        pdfjsLoaded,
        workerConfigured,
        error: null,
      });
    } catch (error) {
      setDebugInfo((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Unknown error",
      }));
    } finally {
      setIsChecking(false);
    }
  }, [url]);

  useEffect(() => {
    runDiagnostics();
  }, [url, runDiagnostics]);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          PDF Debug Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="mb-2 font-medium">File Status</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm">File Accessible:</span>
                <Badge variant={debugInfo.fileExists ? "default" : "destructive"}>
                  {debugInfo.fileExists ? (
                    <>
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Yes
                    </>
                  ) : (
                    <>
                      <AlertCircle className="mr-1 h-3 w-3" />
                      No
                    </>
                  )}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Content Type:</span>
                <Badge variant={debugInfo.contentType.includes("pdf") ? "default" : "secondary"}>
                  {debugInfo.contentType || "Unknown"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">File Size:</span>
                <Badge variant="outline">
                  {debugInfo.fileSize > 0
                    ? formatBytes(debugInfo.fileSize)
                    : "Unknown"}
                </Badge>
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-2 font-medium">PDF.js Status</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm">PDF.js Loaded:</span>
                <Badge variant={debugInfo.pdfjsLoaded ? "default" : "destructive"}>
                  {debugInfo.pdfjsLoaded ? (
                    <>
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Yes
                    </>
                  ) : (
                    <>
                      <AlertCircle className="mr-1 h-3 w-3" />
                      No
                    </>
                  )}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Worker Configured:</span>
                <Badge variant={debugInfo.workerConfigured ? "default" : "destructive"}>
                  {debugInfo.workerConfigured ? (
                    <>
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Yes
                    </>
                  ) : (
                    <>
                      <AlertCircle className="mr-1 h-3 w-3" />
                      No
                    </>
                  )}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {debugInfo.error && (
          <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
            <h4 className="mb-1 font-medium text-red-800 dark:text-red-200">Error</h4>
            <p className="text-sm text-red-600 dark:text-red-300">{debugInfo.error}</p>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={runDiagnostics} disabled={isChecking} variant="outline" size="sm">
            {isChecking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Recheck
              </>
            )}
          </Button>
          <Button onClick={() => window.location.reload()} variant="outline" size="sm">
            Refresh Page
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PdfDebugger;
