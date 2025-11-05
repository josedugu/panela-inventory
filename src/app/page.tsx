import { redirect } from "next/navigation";

export default function Home() {
  // ⚠️ TEMPORAL: Redirigir directamente al dashboard sin login
  redirect("/dashboard");

  // TODO: Cambiar a "/sign-in" cuando Supabase esté configurado
  // redirect("/sign-in");
}
