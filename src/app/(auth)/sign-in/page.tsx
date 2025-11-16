"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { SignIn } from "@/features/auth";
import type { SignInFormData } from "@/features/auth/components/sign-in.types";
import { createClient } from "@/lib/supabase/client";

/**
 * Traduce errores de Supabase a mensajes amigables en español
 */
function getAuthErrorMessage(error: {
  message?: string;
  status?: number;
}): string {
  const message = error.message?.toLowerCase() ?? "";

  // Errores comunes de autenticación
  if (
    message.includes("invalid login credentials") ||
    message.includes("invalid_credentials")
  ) {
    return "Correo electrónico o contraseña incorrectos. Por favor, verifica tus credenciales.";
  }

  if (
    message.includes("email not confirmed") ||
    message.includes("email_not_confirmed")
  ) {
    return "Por favor, confirma tu correo electrónico antes de iniciar sesión.";
  }

  if (
    message.includes("too many requests") ||
    message.includes("too_many_requests")
  ) {
    return "Demasiados intentos. Por favor, espera unos minutos antes de intentar de nuevo.";
  }

  if (
    message.includes("user not found") ||
    message.includes("user_not_found")
  ) {
    return "No se encontró una cuenta con este correo electrónico.";
  }

  if (message.includes("network") || message.includes("fetch")) {
    return "Error de conexión. Por favor, verifica tu conexión a internet e intenta de nuevo.";
  }

  if (message.includes("email rate limit")) {
    return "Demasiados intentos. Por favor, espera unos minutos.";
  }

  // Error genérico
  return "Error al iniciar sesión. Por favor, intenta de nuevo.";
}

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const redirectTo = searchParams.get("redirectTo");

  const handleSignIn = async (data: SignInFormData) => {
    const supabase = createClient();

    // Autenticación con Supabase usando signInWithPassword (práctica estándar)
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email.trim().toLowerCase(),
      password: data.password,
    });

    if (error) {
      // Lanzar error con mensaje traducido para que el componente lo maneje
      const friendlyMessage = getAuthErrorMessage(error);
      throw new Error(friendlyMessage);
    }

    // Verificar que la sesión se estableció correctamente
    if (!authData.session) {
      throw new Error(
        "No se pudo establecer la sesión. Por favor, intenta de nuevo.",
      );
    }

    // Refrescar la página para actualizar el estado de autenticación
    router.refresh();

    // Redirigir a la ruta original solicitada o al dashboard por defecto
    const destination = redirectTo?.startsWith("/") ? redirectTo : "/dashboard";
    router.push(destination);
  };

  return (
    <SignIn
      onSignIn={handleSignIn}
      onNavigateToSignUp={() => router.push("/sign-up")}
      onNavigateToForgotPassword={() => router.push("/forgot-password")}
      initialError={
        errorParam === "auth-callback-error"
          ? "Error en el proceso de autenticación. Por favor, intenta de nuevo."
          : null
      }
    />
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4 bg-surface-1">
          <div className="text-center">
            <output
              className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"
              aria-label="Cargando"
            >
              <span className="sr-only">Cargando...</span>
            </output>
          </div>
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
