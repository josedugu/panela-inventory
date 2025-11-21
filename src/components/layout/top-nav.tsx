"use client";

import { LogOut, Menu, Moon, Plus, Sun } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { useTheme } from "./theme-provider";

interface TopNavProps {
  onMenuClick?: () => void;
  onLogout?: () => void;
}

export function TopNav({ onMenuClick, onLogout }: TopNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evitar mismatch de hidratación esperando a que el componente se monte
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleCreateSale = () => {
    router.push("/dashboard/sales/new");
  };

  // Ocultar botón en la página de crear venta
  const showCreateSaleButton = pathname !== "/dashboard/sales/new";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface-1 backdrop-blur supports-backdrop-filter:bg-surface-1/95">
      <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
          type="button"
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
          {/* Create Sale Button */}
          {showCreateSaleButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCreateSale}
              type="button"
              aria-label="Crear nueva venta"
              title="Crear nueva venta"
            >
              <Plus className="h-5 w-5" />
            </Button>
          )}

          {/* Theme toggle */}
          {mounted ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              type="button"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              type="button"
              disabled
              aria-label="Cargando tema"
            >
              <Moon className="h-5 w-5" />
            </Button>
          )}

          {/* Logout */}
          {onLogout && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" type="button">
                  <LogOut className="h-5 w-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Cerrar sesión?</AlertDialogTitle>
                  <AlertDialogDescription>
                    ¿Estás seguro de que deseas cerrar sesión? Tendrás que
                    iniciar sesión nuevamente para acceder a tu cuenta.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={onLogout}>
                    Cerrar Sesión
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </header>
  );
}
