import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  // useLayoutEffect es más apropiado para efectos síncronos que afectan el layout
  // Se ejecuta antes del paint del navegador, evitando flickering
  React.useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const onChange = () => {
      setIsMobile(mql.matches);
    };

    // Establecer valor inicial inmediatamente
    setIsMobile(mql.matches);

    // Escuchar cambios
    mql.addEventListener("change", onChange);

    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
