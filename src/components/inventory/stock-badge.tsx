"use client";

import { Badge } from "../ui/badge";
import { cn } from "../ui/utils";

export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

interface StockBadgeProps {
  status: StockStatus;
  quantity?: number;
  className?: string;
}

export function StockBadge({ status, quantity, className }: StockBadgeProps) {
  const variants = {
    "in-stock": {
      className: "bg-success-light text-success-foreground border-success-border",
      label: quantity ? `${quantity} In Stock` : "In Stock",
    },
    "low-stock": {
      className: "bg-warning-light text-warning-foreground border-warning-border",
      label: quantity ? `${quantity} Low Stock` : "Low Stock",
    },
    "out-of-stock": {
      className: "bg-error-light text-error-foreground border-error-border",
      label: "Out of Stock",
    },
  };

  const variant = variants[status];

  return (
    <Badge
      variant="outline"
      className={cn(variant.className, className)}
    >
      {variant.label}
    </Badge>
  );
}
