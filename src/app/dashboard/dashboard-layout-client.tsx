"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
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

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <TopNav
        onMenuClick={() => setMobileMenuOpen(true)}
        onViewAllNotifications={() => router.push("/notifications")}
        onLogout={() => router.push("/sign-in")}
      />

      <div className="flex-1 flex overflow-hidden">
        <SidebarNav
          activeItem={pathname}
          onItemClick={(href) => router.push(href)}
          onLogout={() => router.push("/sign-in")}
        />

        <MobileSidebar
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          activeItem={pathname}
          onItemClick={(href) => router.push(href)}
          onLogout={() => router.push("/sign-in")}
        />

        <main className="flex-1 flex flex-col overflow-auto min-h-full">
          {children}
        </main>
      </div>

      <MobileBottomNav
        activeItem={pathname}
        onItemClick={(href) => router.push(href)}
      />
    </div>
  );
}
