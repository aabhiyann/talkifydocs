"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useState, useEffect } from "react";

interface ErrorLog {
  id: string;
  message: string;
  level: "error" | "warn" | "info";
  timestamp: Date | string;
  context?: Record<string, any>;
}

export function ErrorLogViewer() {
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/error-logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error("Failed to fetch error logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Recent Errors
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={fetchLogs} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">Loading...</div>
        ) : logs.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">No recent errors</div>
        ) : (
          <div className="max-h-96 space-y-3 overflow-y-auto">
            {logs.slice(0, 10).map((log) => (
              <div
                key={log.id}
                className="bg-muted/30 hover:bg-muted/50 rounded-lg border p-3 transition-colors"
              >
                <div className="mb-2 flex items-start justify-between">
                  <Badge
                    variant={
                      log.level === "error"
                        ? "destructive"
                        : log.level === "warn"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {log.level}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(log.timestamp), "MMM d, HH:mm:ss")}
                  </span>
                </div>
                <p className="break-words font-mono text-sm">{log.message}</p>
                {log.context && Object.keys(log.context).length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs text-muted-foreground">
                      Context
                    </summary>
                    <pre className="mt-1 overflow-x-auto rounded bg-background p-2 text-xs">
                      {JSON.stringify(log.context, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
