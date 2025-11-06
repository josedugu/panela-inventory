"use client";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/components/ui/utils";

interface StockLevelIndicatorProps {
  current: number;
  max: number;
  lowThreshold?: number;
  className?: string;
}

export function StockLevelIndicator({
  current,
  max,
  lowThreshold = 20,
  className,
}: StockLevelIndicatorProps) {
  const percentage = (current / max) * 100;
  const isLow = percentage <= lowThreshold;
  const isEmpty = current === 0;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-text-secondary">
          {current} / {max} units
        </span>
        <span
          className={cn(
            "text-sm font-medium",
            isEmpty && "text-error",
            isLow && !isEmpty && "text-warning",
            !isLow && !isEmpty && "text-success",
          )}
        >
          {percentage.toFixed(0)}%
        </span>
      </div>
      <Progress
        value={percentage}
        className={cn(
          "h-2",
          isEmpty && "[&>div]:bg-error",
          isLow && !isEmpty && "[&>div]:bg-warning",
          !isLow && !isEmpty && "[&>div]:bg-success",
        )}
      />
    </div>
  );
}
