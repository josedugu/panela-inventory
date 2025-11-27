"use client";

import {
  ArrowRightLeft,
  LayoutDashboard,
  Package,
  Settings,
  Users,
} from "lucide-react";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
  activeItem?: string;
  onItemClick?: (href: string) => void;
}

const navItems: Array<{
  title: string;
  icon: ComponentType<{ className?: string }>;
  href: string;
  match?: (pathname: string) => boolean;
}> = [
  {
    title: "Panel",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "Inventario",
    icon: Package,
    href: "/dashboard/inventory/manage",
    match: (pathname) => pathname.startsWith("/dashboard/inventory"),
  },
  {
    title: "Ventas",
    icon: ArrowRightLeft,
    href: "/dashboard/sales",
  },
  {
    title: "Clientes",
    icon: Users,
    href: "/dashboard/customers",
  },
  {
    title: "Ajustes",
    icon: Settings,
    href: "/dashboard/settings",
  },
];

export function MobileBottomNav({
  activeItem = "/dashboard",
  onItemClick,
}: MobileBottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface-1 lg:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.match
            ? item.match(activeItem ?? "")
            : activeItem === item.href;

          return (
            <button
              type="button"
              key={item.href}
              onClick={() => onItemClick?.(item.href)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors flex-1 max-w-[100px]",
                isActive
                  ? "text-primary"
                  : "text-text-secondary hover:text-text-primary",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{item.title}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
