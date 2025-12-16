import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: number | string;
  change?: string;
  trend?: "up" | "down";
  icon?: React.ReactNode;
}

export function StatsCard({ title, value, change, trend, icon }: StatsCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardContent className="p-6">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
        <p className="mb-2 text-3xl font-bold">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        {change && trend && (
          <div
            className={cn(
              "flex items-center text-sm font-medium",
              trend === "up"
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400",
            )}
          >
            {trend === "up" ? (
              <ArrowUp className="mr-1 h-4 w-4" />
            ) : (
              <ArrowDown className="mr-1 h-4 w-4" />
            )}
            <span>{change}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
