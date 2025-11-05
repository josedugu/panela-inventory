import { DashboardLayoutClient } from "./dashboard-layout-client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ⚠️ TEMPORAL: Autenticación deshabilitada para ver la UI
  // TODO: Descomentar después de configurar Supabase

  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
