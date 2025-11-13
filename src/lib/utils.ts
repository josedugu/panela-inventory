import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatea un valor numérico como precio en formato colombiano (COP)
 * @param value - Valor numérico a formatear
 * @param options - Opciones de formateo
 * @param options.minimumFractionDigits - Número mínimo de decimales (default: 0)
 * @param options.maximumFractionDigits - Número máximo de decimales (default: 0)
 * @returns String formateado como "$1.000.000" (formato colombiano)
 * @example
 * formatPrice(1000000) // "$1.000.000"
 * formatPrice(1000000.5, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) // "$1.000.000,50"
 */
export function formatPrice(
  value: number | null | undefined,
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  },
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "$0";
  }

  const formatter = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: options?.minimumFractionDigits ?? 0,
    maximumFractionDigits: options?.maximumFractionDigits ?? 0,
  });

  return formatter.format(value);
}
