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
            <AlertCircle className="w-5 h-5" />
            Recent Errors
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={fetchLogs} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No recent errors
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {logs.slice(0, 10).map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
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
                <p className="text-sm font-mono break-words">{log.message}</p>
                {log.context && Object.keys(log.context).length > 0 && (
                  <details className="mt-2">
                    <summary className="text-xs text-muted-foreground cursor-pointer">
                      Context
                    </summary>
                    <pre className="mt-1 text-xs bg-background p-2 rounded overflow-x-auto">
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

