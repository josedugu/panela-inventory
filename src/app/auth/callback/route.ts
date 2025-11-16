import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function getSafeNext(nextParam: string | null) {
  if (nextParam?.startsWith("/")) {
    return nextParam;
  }

  return "/dashboard";
}

function buildHashRedirectResponse(origin: string, nextPath: string) {
  const html = `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charSet="utf-8" />
    <title>Procesando autenticación...</title>
    <style>
      body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #020617; color: #e2e8f0; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    </style>
  </head>
  <body>
    <script>
      (function() {
        const origin = ${JSON.stringify(origin)};
        const nextPath = ${JSON.stringify(nextPath)};
        const fallback = origin + "/sign-in?error=auth-callback-error";
        const hash = window.location.hash || "";

        if (hash.length > 1) {
          const params = new URLSearchParams(hash.substring(1));
          const type = params.get("type");

          if (type === "invite" || type === "recovery") {
            window.location.replace(origin + "/set-password" + hash);
            return;
          }

          if (params.get("access_token")) {
            window.location.replace(origin + nextPath + hash);
            return;
          }
        }

        window.location.replace(fallback);
      })();
    </script>
  </body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  const next = getSafeNext(searchParams.get("next"));

  // Si el código incluye un tipo de invitación o recuperación, redirigir a set-password
  if (code && (type === "invite" || type === "recovery")) {
    return NextResponse.redirect(
      `${origin}/set-password?code=${code}&type=${type}`,
    );
  }

  // Flujo normal PKCE (OAuth, magic links, etc.)
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    return NextResponse.redirect(`${origin}/sign-in?error=auth-callback-error`);
  }

  // No hay código: intentar procesar el hash en el cliente (flujo de invitaciones)
  return buildHashRedirectResponse(origin, next);
}
