"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/components/ui/utils";

export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

interface StockBadgeProps {
  status: StockStatus;
  quantity?: number;
  className?: string;
}

export function StockBadge({ status, quantity, className }: StockBadgeProps) {
  const variants = {
    "in-stock": {
      className: cn(
        "bg-success-light border-success-border",
        "text-foreground dark:text-white",
      ),
      label: quantity ? `${quantity} In Stock` : "In Stock",
    },
    "low-stock": {
      className: cn(
        "bg-warning-light border-warning-border",
        "text-foreground dark:text-white",
      ),
      label: quantity ? `${quantity} Low Stock` : "Low Stock",
    },
    "out-of-stock": {
      className: cn(
        "bg-error-light border-error-border",
        "text-foreground dark:text-white",
      ),
      label: "Out of Stock",
    },
  } satisfies Record<StockStatus, { className: string; label: string }>;

  const variant = variants[status];

  return (
    <Badge variant="outline" className={cn(variant.className, className)}>
      {variant.label}
    </Badge>
  );
}
