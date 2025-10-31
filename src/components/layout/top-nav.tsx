"use client";

import { Moon, Sun, Menu } from "lucide-react";
import { Button } from "../ui/button";
import { useTheme } from "./theme-provider";
import { NotificationsPopover } from "./notifications-popover";

interface TopNavProps {
  onMenuClick?: () => void;
  onViewAllNotifications?: () => void;
}

export function TopNav({ onMenuClick, onViewAllNotifications }: TopNavProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface-1 backdrop-blur supports-[backdrop-filter]:bg-surface-1/95">
      <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-semibold">IG</span>
          </div>
          <span className="font-semibold hidden sm:inline-block">
            Inventario Gestión
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>

          {/* Notifications */}
          <NotificationsPopover onViewAll={onViewAllNotifications} />
        </div>
      </div>
    </header>
  );
}
