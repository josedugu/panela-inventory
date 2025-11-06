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

    return () => subscription.unsubscribe();
  }, [router, queryClient, supabase.auth]);

  const signOut = async () => {
    await supabase.auth.signOut();
    // Invalidar cache de React Query
    queryClient.setQueryData(["auth", "user"], null);
    router.push("/sign-in");
    router.refresh();
  };

  return {
    user: user ?? null,
    loading: isLoading,
    signOut,
  };
}
