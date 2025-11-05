"use client";

import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/components/ui/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    label: string;
  };
  icon?: LucideIcon;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  className,
}: StatCardProps) {
  const isPositive = change && change.value > 0;
  const isNegative = change && change.value < 0;

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-text-secondary">{title}</p>
          {Icon && (
            <div className="p-2 bg-surface-2 rounded-lg">
              <Icon className="h-5 w-5 text-text-secondary" />
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-semibold">{value}</p>
          {change && (
            <p className="text-sm">
              <span
                className={cn(
                  "font-medium",
                  isPositive && "text-success",
                  isNegative && "text-error",
                )}
              >
                {isPositive && "+"}
                {change.value}%
              </span>
              <span className="text-text-secondary ml-1">{change.label}</span>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
