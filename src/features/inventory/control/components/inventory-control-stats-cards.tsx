"use client";

import { DollarSign, TrendingUp } from "lucide-react";
import { StatCard } from "../../general-ui/stat-card";
import type { InventoryControlStats } from "../types";

interface InventoryControlStatsCardsProps {
  stats?: InventoryControlStats;
  isLoading: boolean;
}

export function InventoryControlStatsCards({
  stats,
  isLoading,
}: InventoryControlStatsCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <div className="animate-pulse">
          <div className="h-32 rounded-lg bg-surface-2"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-32 rounded-lg bg-surface-2"></div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <StatCard
        title="Costo Total"
        value={formatCurrency(stats.totalCosto)}
        icon={DollarSign}
        className="md:col-span-1"
      />

      <StatCard
        title="Valor Total PVP"
        value={formatCurrency(stats.totalPvp)}
        icon={TrendingUp}
        className="md:col-span-1"
      />
    </div>
  );
}
