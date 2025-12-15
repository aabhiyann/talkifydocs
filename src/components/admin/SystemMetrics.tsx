"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Server, Database, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface SystemMetricsProps {
  initialMetrics?: {
    avgProcessingTime?: number;
    failedUploads?: number;
    avgMessagesPerUser?: number;
    storageUsed?: bigint | number;
    activeUsers24h?: number;
    errorRate?: number;
  };
}

export function SystemMetrics({ initialMetrics }: SystemMetricsProps) {
  const [metrics, setMetrics] = useState(initialMetrics || {});

  useEffect(() => {
    // Optionally refresh metrics periodically
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/admin/metrics");
        if (res.ok) {
          const data = await res.json();
          setMetrics(data);
        }
      } catch (error) {
        console.error("Failed to fetch metrics:", error);
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: bigint | number | undefined) => {
    if (!bytes) return "0 B";
    const numBytes = typeof bytes === "bigint" ? Number(bytes) : bytes;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    if (numBytes === 0) return "0 B";
    const i = Math.floor(Math.log(numBytes) / Math.log(1024));
    return `${(numBytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          System Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Storage Used</p>
                <p className="text-xs text-muted-foreground">Total file storage</p>
              </div>
            </div>
            <p className="text-lg font-semibold">
              {formatBytes(metrics.storageUsed)}
            </p>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Failed Uploads</p>
                <p className="text-xs text-muted-foreground">Last 24 hours</p>
              </div>
            </div>
            <p className="text-lg font-semibold">{metrics.failedUploads ?? 0}</p>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Avg Messages/User</p>
                <p className="text-xs text-muted-foreground">Average per user</p>
              </div>
            </div>
            <p className="text-lg font-semibold">
              {metrics.avgMessagesPerUser
                ? Math.round(metrics.avgMessagesPerUser)
                : 0}
            </p>
          </div>

          {metrics.avgProcessingTime !== undefined && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Avg Processing Time</p>
                  <p className="text-xs text-muted-foreground">PDF processing</p>
                </div>
              </div>
              <p className="text-lg font-semibold">
                {metrics.avgProcessingTime.toFixed(1)}s
              </p>
            </div>
          )}

          {metrics.activeUsers24h !== undefined && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Active Users (24h)</p>
                  <p className="text-xs text-muted-foreground">Recent activity</p>
                </div>
              </div>
              <p className="text-lg font-semibold">{metrics.activeUsers24h}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

