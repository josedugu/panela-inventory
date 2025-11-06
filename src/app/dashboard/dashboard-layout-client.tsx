"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { MobileSidebar, SidebarNav } from "@/components/layout/sidebar-nav";
import { TopNav } from "@/components/layout/top-nav";

export function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  // Estado local para actualización inmediata del elemento activo
  const [activeItem, setActiveItem] = useState(pathname);

  // Sincronizar con pathname cuando cambie (después de navegación)
  useEffect(() => {
    setActiveItem(pathname);
  }, [pathname]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <TopNav
        onMenuClick={() => setMobileMenuOpen(true)}
        onLogout={() => router.push("/sign-in")}
      />

      <div className="flex-1 flex overflow-hidden">
        <SidebarNav
          activeItem={activeItem}
          onItemClick={(href) => {
            setActiveItem(href); // Actualizar inmediatamente
            router.push(href);
          }}
          onLogout={() => router.push("/sign-in")}
        />

        <MobileSidebar
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          activeItem={activeItem}
          onItemClick={(href) => {
            setActiveItem(href); // Actualizar inmediatamente
            router.push(href);
          }}
          onLogout={() => router.push("/sign-in")}
        />

        <main className="flex-1 flex flex-col overflow-auto min-h-full">
          {children}
        </main>
      </div>

      <MobileBottomNav
        activeItem={activeItem}
        onItemClick={(href) => {
          setActiveItem(href); // Actualizar inmediatamente
          router.push(href);
        }}
      />
    </div>
  );
}
