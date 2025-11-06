"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 30, // 30 minutos por defecto (cacheo para todas las páginas)
            gcTime: 1000 * 60 * 60, // 1 hora en memoria (garbage collection time)
            refetchOnWindowFocus: false, // Desactivado para mejor performance en navegación
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
