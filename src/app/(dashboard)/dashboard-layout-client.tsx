"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { TopNav } from "@/components/layout/top-nav";
import { SidebarNav, MobileSidebar } from "@/components/layout/sidebar-nav";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import type { User } from "@supabase/supabase-js";

export function DashboardLayoutClient({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <TopNav
        onMenuClick={() => setMobileMenuOpen(true)}
        onViewAllNotifications={() => router.push("/notifications")}
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

        <main className="flex-1 overflow-auto pb-16 lg:pb-0">
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

