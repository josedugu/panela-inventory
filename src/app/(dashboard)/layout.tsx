import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardLayoutClient } from "./dashboard-layout-client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ⚠️ TEMPORAL: Autenticación deshabilitada para ver la UI
  // TODO: Descomentar después de configurar Supabase
  
  /*
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return <DashboardLayoutClient user={user}>{children}</DashboardLayoutClient>;
  */

  // Crear un usuario mock temporal
  const mockUser = {
    id: "mock-user-id",
    email: "demo@example.com",
    created_at: new Date().toISOString(),
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    confirmation_sent_at: "",
  };

  return <DashboardLayoutClient user={mockUser as any}>{children}</DashboardLayoutClient>;
}

