"use client";

import {
  ArrowRightLeft,
  BarChart3,
  ChevronLeft,
  Database,
  FileText,
  LayoutDashboard,
  Package,
  Settings,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { canAccessRoute } from "@/config/permissions";
import { MASTER_DATA_SECTIONS } from "@/features/master-data/conts";
import { useUserRole } from "@/hooks/use-user-role";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";

interface NavChildItem {
  title: string;
  href: string;
  badge?: string;
}

interface NavItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  badge?: string;
  children?: NavChildItem[];
}

const navItems: NavItem[] = [
  {
    title: "Panel Principal",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "Inventario",
    icon: Package,
    children: [
      {
        title: "Gestión",
        href: "/dashboard/inventory/manage",
      },
      {
        title: "Movimientos",
        href: "/dashboard/inventory/movements",
      },
    ],
  },
  {
    title: "Datos Maestros",
    icon: Database,
    children: MASTER_DATA_SECTIONS.map((section) => ({
      title: section.label,
      href: `/dashboard/master-data/${section.slug}`,
    })),
  },
  {
    title: "Ventas",
    icon: ArrowRightLeft,
    children: [
      {
        title: "Historial",
        href: "/dashboard/sales",
      },
      {
        title: "Nueva venta",
        href: "/dashboard/sales/new",
      },
    ],
  },
  {
    title: "Clientes",
    icon: Users,
    href: "/dashboard/customers",
  },
  {
    title: "Reportes",
    icon: FileText,
    href: "/dashboard/reports",
  },
  {
    title: "Analíticas",
    icon: BarChart3,
    href: "/dashboard/analytics",
  },
  {
    title: "Configuración",
    icon: Settings,
    href: "/dashboard/settings",
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
  onLogout: _onLogout,
  className,
}: SidebarNavProps) {
  const { role } = useUserRole();
  const [collapsed, setCollapsed] = useState(false);

  // Filtrar items del sidebar según permisos
  const filteredNavItems = useMemo(() => {
    return navItems
      .filter((item) => {
        // Si tiene href directo, verificar acceso
        if (item.href) {
          return canAccessRoute(role, item.href);
        }
        // Si tiene children, verificar si al menos uno tiene acceso
        if (item.children) {
          return item.children.some((child) =>
            canAccessRoute(role, child.href),
          );
        }
        return false;
      })
      .map((item) => {
        // Filtrar children también
        if (item.children) {
          return {
            ...item,
            children: item.children.filter((child) =>
              canAccessRoute(role, child.href),
            ),
          };
        }
        return item;
      });
  }, [role]);

  const activeGroup = useMemo(
    () =>
      filteredNavItems.find((item) =>
        item.children?.some((child) => child.href === activeItem),
      )?.title,
    [activeItem, filteredNavItems],
  );
  const [openGroups, setOpenGroups] = useState<string[]>([]);

  useEffect(() => {
    if (activeGroup) {
      setOpenGroups((prev) =>
        prev.includes(activeGroup) ? prev : [...prev, activeGroup],
      );
    }
  }, [activeGroup]);

  const handleNavigate = (href?: string) => {
    if (href) {
      onItemClick?.(href);
    }
  };

  const handleGroupToggle = (group: string, isOpen: boolean) => {
    setOpenGroups((prev) => {
      if (isOpen) {
        return prev.includes(group) ? prev : [...prev, group];
      }
      return prev.filter((item) => item !== group);
    });
  };

  const renderCollapsedNav = () => (
    <nav className="space-y-1">
      {filteredNavItems.map((item) => {
        const Icon = item.icon;
        const hasChildren = Boolean(item.children?.length);
        const targetHref = hasChildren ? item.children?.[0]?.href : item.href;

        if (!targetHref) {
          return null;
        }

        const isActive = hasChildren
          ? item.children?.some((child) => child.href === activeItem)
          : activeItem === item.href;

        return (
          <Button
            key={item.title}
            variant={isActive ? "secondary" : "ghost"}
            className="w-full justify-center px-2"
            onClick={() => handleNavigate(targetHref)}
          >
            <Icon className="h-5 w-5 shrink-0" />
          </Button>
        );
      })}
    </nav>
  );

  const renderExpandedNav = () => (
    <div className="space-y-1">
      {filteredNavItems.map((item) => {
        const Icon = item.icon;
        const hasChildren = Boolean(item.children?.length);

        if (!hasChildren) {
          const isActive = activeItem === item.href;
          return (
            <Button
              key={item.href ?? item.title}
              variant={isActive ? "secondary" : "ghost"}
              className="w-full justify-start gap-3"
              onClick={() => handleNavigate(item.href)}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="flex-1 text-left">{item.title}</span>
              {item.badge && (
                <span className="ml-auto bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                  {item.badge}
                </span>
              )}
            </Button>
          );
        }

        const isGroupActive = item.children?.some(
          (child) => child.href === activeItem,
        );
        const isOpen = openGroups.includes(item.title);

        return (
          <Accordion
            key={item.title}
            type="multiple"
            value={isOpen ? [item.title] : []}
            onValueChange={(value) =>
              handleGroupToggle(item.title, value.includes(item.title))
            }
            className="border-none"
          >
            <AccordionItem value={item.title} className="border-none">
              <AccordionTrigger
                className={cn(
                  "px-3 py-2 rounded-lg",
                  isGroupActive && "text-primary",
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="flex-1 text-left">{item.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-0">
                <div className="flex flex-col gap-1 pl-11 pr-3">
                  {item.children?.map((child) => {
                    const isChildActive = child.href === activeItem;
                    return (
                      <Button
                        key={child.href}
                        variant={isChildActive ? "secondary" : "ghost"}
                        className="justify-start"
                        onClick={() => handleNavigate(child.href)}
                      >
                        {child.title}
                      </Button>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        );
      })}
    </div>
  );

  return (
    <aside
      className={cn(
        "border-r border-border bg-surface-1 transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        "hidden lg:block h-full",
        className,
      )}
    >
      <div className="flex h-full flex-col overflow-hidden">
        {/* Collapse toggle */}
        <div className="flex items-center justify-end p-4 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8"
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 transition-transform",
                collapsed && "rotate-180",
              )}
            />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 min-h-0 px-3">
          {collapsed ? renderCollapsedNav() : renderExpandedNav()}
        </ScrollArea>

        {/* User info and logout */}
        {!collapsed && (
          <div className="border-t border-border p-4 space-y-3 shrink-0">
            <div className="flex items-center gap-3 rounded-lg bg-surface-2 p-3">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                <span className="text-sm text-primary-foreground font-medium">
                  JP
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Juan Pérez</p>
                <p className="text-xs text-text-secondary truncate">Admin</p>
              </div>
            </div>
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
  onLogout: _onLogout,
}: MobileSidebarProps) {
  const { role } = useUserRole();

  // Filtrar items del sidebar según permisos
  const filteredNavItems = useMemo(() => {
    return navItems
      .filter((item) => {
        if (item.href) {
          return canAccessRoute(role, item.href);
        }
        if (item.children) {
          return item.children.some((child) =>
            canAccessRoute(role, child.href),
          );
        }
        return false;
      })
      .map((item) => {
        if (item.children) {
          return {
            ...item,
            children: item.children.filter((child) =>
              canAccessRoute(role, child.href),
            ),
          };
        }
        return item;
      });
  }, [role]);

  const activeGroup = useMemo(
    () =>
      filteredNavItems.find((item) =>
        item.children?.some((child) => child.href === activeItem),
      )?.title,
    [activeItem, filteredNavItems],
  );
  const [openGroups, setOpenGroups] = useState<string[]>([]);

  useEffect(() => {
    if (activeGroup) {
      setOpenGroups((prev) =>
        prev.includes(activeGroup) ? prev : [...prev, activeGroup],
      );
    }
  }, [activeGroup]);

  const handleNavigate = (href?: string) => {
    if (href) {
      onItemClick?.(href);
      onClose();
    }
  };

  const handleGroupToggle = (group: string, isOpenGroup: boolean) => {
    setOpenGroups((prev) => {
      if (isOpenGroup) {
        return prev.includes(group) ? prev : [...prev, group];
      }
      return prev.filter((item) => item !== group);
    });
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-overlay lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-surface-1 transform transition-transform duration-300 lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col overflow-hidden">
          {/* Logo */}
          <div className="flex items-center gap-2 p-4 border-b border-border shrink-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-semibold">IG</span>
            </div>
            <span className="font-semibold">Inventario Gestión</span>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 min-h-0 px-3 py-4">
            <div className="space-y-1">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const hasChildren = Boolean(item.children?.length);

                if (!hasChildren) {
                  const isActive = activeItem === item.href;
                  return (
                    <Button
                      key={item.href ?? item.title}
                      variant={isActive ? "secondary" : "ghost"}
                      className="w-full justify-start gap-3"
                      onClick={() => handleNavigate(item.href)}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span className="flex-1 text-left">{item.title}</span>
                      {item.badge && (
                        <span className="ml-auto bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                          {item.badge}
                        </span>
                      )}
                    </Button>
                  );
                }

                const isGroupActive = item.children?.some(
                  (child) => child.href === activeItem,
                );
                const isOpen = openGroups.includes(item.title);

                return (
                  <Accordion
                    key={item.title}
                    type="multiple"
                    value={isOpen ? [item.title] : []}
                    onValueChange={(value) =>
                      handleGroupToggle(item.title, value.includes(item.title))
                    }
                    className="border-none"
                  >
                    <AccordionItem value={item.title} className="border-none">
                      <AccordionTrigger
                        className={cn(
                          "px-3 py-2 rounded-lg",
                          isGroupActive && "text-primary",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 shrink-0" />
                          <span className="flex-1 text-left">{item.title}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-0">
                        <div className="flex flex-col gap-1 pl-11 pr-3">
                          {item.children?.map((child) => {
                            const isChildActive = child.href === activeItem;
                            return (
                              <Button
                                key={child.href}
                                variant={isChildActive ? "secondary" : "ghost"}
                                className="justify-start"
                                onClick={() => handleNavigate(child.href)}
                              >
                                {child.title}
                              </Button>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                );
              })}
            </div>
          </ScrollArea>

          {/* User info and logout */}
          <div className="border-t border-border p-4 space-y-3 shrink-0">
            <div className="flex items-center gap-3 rounded-lg bg-surface-2 p-3">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                <span className="text-sm text-primary-foreground font-medium">
                  JP
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Juan Pérez</p>
                <p className="text-xs text-text-secondary truncate">Admin</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
