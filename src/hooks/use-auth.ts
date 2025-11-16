"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function useAuth() {
  const router = useRouter();
  const supabase = createClient();
  const queryClient = useQueryClient();

  // Obtener usuario con React Query (elimina necesidad de useState para user y loading)
  const { data: user, isLoading } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: true,
  });

  // Suscripción a cambios de auth (este useEffect es necesario para event listeners)
  // Sin embargo, optimizado: usa React Query para actualizar el estado
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Actualizar React Query cache en lugar de setState directo
      queryClient.setQueryData(["auth", "user"], session?.user ?? null);
      router.refresh();
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [router, queryClient, supabase.auth]);

  const signOut = async () => {
    // Crear una Promise que se resuelva cuando se confirme el cierre de sesión
    // IMPORTANTE: Crear la suscripción ANTES de llamar a signOut() para capturar el evento
    let subscription: { unsubscribe: () => void } | undefined;

    const waitForSignOut = new Promise<void>((resolve) => {
      // Suscribirse al evento de cambio de estado de auth
      const {
        data: { subscription: authSubscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        // Cuando se detecta el evento SIGNED_OUT y no hay sesión
        if (event === "SIGNED_OUT" && !session) {
          // Limpiar la suscripción
          authSubscription?.unsubscribe();
          resolve();
        }
      });

      // Guardar referencia para limpieza en caso de error
      subscription = authSubscription ?? undefined;
    });

    // Iniciar el cierre de sesión y esperar su resultado
    // signOut() limpia las cookies automáticamente
    const { error } = await supabase.auth.signOut();

    if (error) {
      // Limpiar suscripción si hay error
      subscription?.unsubscribe();
      throw error;
    }

    // Esperar a que el evento SIGNED_OUT se dispare (confirma que la sesión se cerró)
    await waitForSignOut;

    // Verificación final: confirmar que getSession() retorna null
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      // Si aún hay sesión después del evento SIGNED_OUT, algo salió mal
      throw new Error("No se pudo cerrar la sesión completamente");
    }

    // Invalidar cache de React Query
    queryClient.setQueryData(["auth", "user"], null);
    queryClient.invalidateQueries();

    // Forzar refresh completo usando window.location
    // Esto asegura que el middleware vea el estado actualizado
    // y que las cookies se hayan limpiado completamente
    window.location.href = "/sign-in";
  };

  return {
    user: user ?? null,
    loading: isLoading,
    signOut,
  };
}
