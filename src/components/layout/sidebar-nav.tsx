"use client";

import {
  LayoutDashboard,
  Package,
  ArrowRightLeft,
  BarChart3,
  Settings,
  FileText,
  ChevronLeft,
  Palette,
  Grid3x3,
  Database,
  LogOut,
  Users,
} from "lucide-react";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "../ui/utils";
import { useState } from "react";

interface NavItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: string;
}

const navItems: NavItem[] = [
  {
    title: "Panel Principal",
    icon: LayoutDashboard,
    href: "#dashboard",
  },
  {
    title: "Inventario",
    icon: Package,
    href: "#inventory",
  },
  {
    title: "Datos Maestros",
    icon: Database,
    href: "#master-data",
  },
  {
    title: "Ventas",
    icon: ArrowRightLeft,
    href: "#sales",
  },
  {
    title: "Clientes",
    icon: Users,
    href: "#customers",
  },
  {
    title: "Reportes",
    icon: FileText,
    href: "#reports",
  },
  {
    title: "Analíticas",
    icon: BarChart3,
    href: "#analytics",
  },
  {
    title: "Configuración",
    icon: Settings,
    href: "#settings",
  },
  {
    title: "Componentes",
    icon: Grid3x3,
    href: "#components",
  },
  {
    title: "Guía de Estilo",
    icon: Palette,
    href: "#style-guide",
  },
];

interface SidebarNavProps {
  activeItem?: string;
  onItemClick?: (href: string) => void;
  onLogout?: () => void;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function SidebarNav({
  activeItem = "#dashboard",
  onItemClick,
  onLogout,
  className,
  isOpen = true,
  onClose,
}: SidebarNavProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "border-r border-border bg-surface-1 transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        "hidden lg:block",
        className
      )}
    >
      <div className="flex h-full flex-col">
        {/* Collapse toggle */}
        <div className="flex items-center justify-end p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8"
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 transition-transform",
                collapsed && "rotate-180"
              )}
            />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.href;

              return (
                <Button
                  key={item.href}
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3",
                    collapsed && "justify-center px-2"
                  )}
                  onClick={() => onItemClick?.(item.href)}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.title}</span>
                      {item.badge && (
                        <span className="ml-auto bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Button>
              );
            })}
          </nav>
        </ScrollArea>

        {/* User info and logout */}
        {!collapsed && (
          <div className="border-t border-border p-4 space-y-3">
            <div className="flex items-center gap-3 rounded-lg bg-surface-2 p-3">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-sm text-primary-foreground font-medium">
                  JP
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Juan Pérez</p>
                <p className="text-xs text-text-secondary truncate">Admin</p>
              </div>
            </div>
            {onLogout && (
              <Button
                variant="outline"
                className="w-full justify-start gap-3"
                onClick={onLogout}
              >
                <LogOut className="h-4 w-4" />
                <span>Cerrar Sesión</span>
              </Button>
            )}
          </div>
        )}
        {collapsed && onLogout && (
          <div className="border-t border-border p-2">
            <Button
              variant="ghost"
              size="icon"
              className="w-full"
              onClick={onLogout}
              title="Cerrar Sesión"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}

// Mobile sidebar overlay
interface MobileSidebarProps extends SidebarNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({
  isOpen,
  onClose,
  activeItem,
  onItemClick,
  onLogout,
}: MobileSidebarProps) {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-overlay lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-surface-1 transform transition-transform duration-300 lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center gap-2 p-4 border-b border-border">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-semibold">IG</span>
            </div>
            <span className="font-semibold">Inventario Gestión</span>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeItem === item.href;

                return (
                  <Button
                    key={item.href}
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => {
                      onItemClick?.(item.href);
                      onClose();
                    }}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="flex-1 text-left">{item.title}</span>
                    {item.badge && (
                      <span className="ml-auto bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                        {item.badge}
                      </span>
                    )}
                  </Button>
                );
              })}
            </nav>
          </ScrollArea>

          {/* User info and logout */}
          <div className="border-t border-border p-4 space-y-3">
            <div className="flex items-center gap-3 rounded-lg bg-surface-2 p-3">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-sm text-primary-foreground font-medium">
                  JP
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Juan Pérez</p>
                <p className="text-xs text-text-secondary truncate">Admin</p>
              </div>
            </div>
            {onLogout && (
              <Button
                variant="outline"
                className="w-full justify-start gap-3"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
              >
                <LogOut className="h-4 w-4" />
                <span>Cerrar Sesión</span>
              </Button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
