"use client";

import {
  ModernCard,
  ModernCardContent,
  ModernCardHeader,
  ModernCardTitle,
} from "@/components/ui/modern-card";
import { Activity, Server, Database, AlertCircle } from "lucide-react";
import { trpc } from "@/app/_trpc/client";
import { memo } from "react";

interface SystemMetricsProps {
  initialMetrics?: {
    avgProcessingTime?: number;
    failedUploads?: number;
    avgMessagesPerUser?: number;
    storageUsed?: bigint | number | string;
    activeUsers24h?: number;
    errorRate?: number;
  };
}

export const SystemMetrics = memo(({ initialMetrics }: SystemMetricsProps) => {
  const { data: metrics } = trpc.getSystemMetrics.useQuery(undefined, {
    initialData: initialMetrics as any,
    refetchInterval: 30000,
  });

  const formatBytes = (bytes: bigint | number | string | undefined) => {
    if (bytes === undefined || bytes === null) return "0 B";
    const numBytes = typeof bytes === "bigint" ? Number(bytes) : Number(bytes);
    if (isNaN(numBytes)) return "0 B";
    
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    if (numBytes === 0) return "0 B";
    const i = Math.floor(Math.log(numBytes) / Math.log(1024));
    return `${(numBytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <ModernCard>
      <ModernCardHeader>
        <ModernCardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          System Metrics
        </ModernCardTitle>
      </ModernCardHeader>
      <ModernCardContent>
        <div className="space-y-4">
          <div className="bg-muted/50 flex items-center justify-between rounded-lg p-3">
            <div className="flex items-center gap-3">
              <Server className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Storage Used</p>
                <p className="text-xs text-muted-foreground">Total file storage</p>
              </div>
            </div>
            <p className="text-lg font-semibold">{formatBytes(metrics?.storageUsed)}</p>
          </div>

          <div className="bg-muted/50 flex items-center justify-between rounded-lg p-3">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Failed Uploads</p>
                <p className="text-xs text-muted-foreground">Last 24 hours</p>
              </div>
            </div>
            <p className="text-lg font-semibold">{metrics?.failedUploads ?? 0}</p>
          </div>

          <div className="bg-muted/50 flex items-center justify-between rounded-lg p-3">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Avg Messages/User</p>
                <p className="text-xs text-muted-foreground">Average per user</p>
              </div>
            </div>
            <p className="text-lg font-semibold">
              {metrics?.avgMessagesPerUser ? Math.round(metrics.avgMessagesPerUser) : 0}
            </p>
          </div>

          {metrics?.avgProcessingTime !== undefined && (
            <div className="bg-muted/50 flex items-center justify-between rounded-lg p-3">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Avg Processing Time</p>
                  <p className="text-xs text-muted-foreground">PDF processing</p>
                </div>
              </div>
              <p className="text-lg font-semibold">{metrics.avgProcessingTime.toFixed(1)}s</p>
            </div>
          )}

          {metrics?.activeUsers24h !== undefined && (
            <div className="bg-muted/50 flex items-center justify-between rounded-lg p-3">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Active Users (24h)</p>
                  <p className="text-xs text-muted-foreground">Recent activity</p>
                </div>
              </div>
              <p className="text-lg font-semibold">{metrics.activeUsers24h}</p>
            </div>
          )}
        </div>
      </ModernCardContent>
    </ModernCard>
  );
});

SystemMetrics.displayName = "SystemMetrics";