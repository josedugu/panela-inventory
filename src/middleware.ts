import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Middleware de protección de rutas
 *
 * Este middleware:
 * 1. Actualiza la sesión de Supabase
 * 2. Protege rutas que requieren autenticación
 * 3. Redirige usuarios no autenticados a /sign-in
 * 4. Redirige usuarios autenticados desde rutas públicas al dashboard
 * 5. Evita loops infinitos verificando la ruta de destino antes de redirigir
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - *.svg, *.png, *.jpg, *.jpeg, *.gif, *.webp (image files)
     * - Rutas públicas de autenticación (sign-in, sign-up, forgot-password, set-password, auth/callback)
     * - Página de no autorizado (unauthorized)
     * - api routes (si las hay, se pueden proteger individualmente)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|sign-in|sign-up|forgot-password|set-password|auth/callback|unauthorized|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
