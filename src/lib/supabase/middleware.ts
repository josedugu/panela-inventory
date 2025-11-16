import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Rutas públicas que no requieren autenticación
 * Estas rutas deben ser accesibles sin sesión activa
 */
const PUBLIC_ROUTES = [
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/set-password",
  "/auth/callback",
] as const;

/**
 * Rutas protegidas que requieren autenticación
 * Todas las rutas que empiecen con estos prefijos necesitan sesión activa
 */
const PROTECTED_ROUTE_PREFIXES = ["/dashboard"] as const;

function normalizePathname(pathname: string): string {
  if (pathname === "/") {
    return "/";
  }
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed.length > 0 ? trimmed : "/";
}

/**
 * Verifica si una ruta es pública
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Verifica si una ruta es protegida
 */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/**
 * Obtiene la URL de redirección para usuarios autenticados
 * que intentan acceder a rutas públicas
 */
function getAuthRedirectUrl(pathname: string): string {
  if (pathname === "/auth/callback") {
    return "/dashboard";
  }
  return "/dashboard";
}

/**
 * Actualiza la sesión de Supabase y protege las rutas
 */
export async function updateSession(request: NextRequest) {
  const originalPathname = request.nextUrl.pathname;
  const pathname = normalizePathname(originalPathname);

  // Permitir siempre el callback de auth (necesario para el flujo de autenticación)
  if (pathname === "/auth/callback") {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase environment variables");
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          // Si el valor está vacío, eliminar la cookie
          if (value === "" || value === null || value === undefined) {
            response.cookies.delete(name);
          } else {
            response.cookies.set(name, value, options);
          }
        });
      },
    },
  });

  // Verificar el usuario actual
  // Usar getClaims() para validar el JWT localmente usando la clave pública del servidor
  // Es más eficiente que getUser() (no requiere solicitud HTTP) y más seguro que getSession()
  const { data } = await supabase.auth.getClaims();

  const isAuthenticated = !!data?.claims;
  const isPublic = isPublicRoute(pathname);
  const isProtected = isProtectedRoute(pathname);
  const redirectTarget = `${pathname}${request.nextUrl.search ?? ""}`;

  // Caso 1: Usuario autenticado intentando acceder a ruta pública de auth
  // Redirigir al dashboard para evitar loops
  if (isAuthenticated && isPublic && pathname !== "/auth/callback") {
    const redirectUrl = getAuthRedirectUrl(pathname);
    // Evitar loop: solo redirigir si no está ya en la ruta de destino
    if (pathname !== redirectUrl) {
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  }

  // Caso 2: Usuario no autenticado intentando acceder a ruta protegida
  // Redirigir a sign-in
  if (!isAuthenticated && isProtected) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirectTo", redirectTarget);
    return NextResponse.redirect(signInUrl);
  }

  // Caso 3: Usuario no autenticado en la raíz
  // Redirigir a sign-in
  if (!isAuthenticated && pathname === "/") {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Caso 4: Usuario autenticado en la raíz
  // Redirigir al dashboard
  if (isAuthenticated && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Permitir el acceso en todos los demás casos
  return response;
}
