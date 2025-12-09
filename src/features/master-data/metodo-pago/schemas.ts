import { z } from "zod";

export const metodoPagoFormSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido"),
  esCredito: z.boolean(),
  comisionAsesor: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === "") return true;
      const num = parseFloat(val);
      return !Number.isNaN(num) && num >= 0 && num <= 100;
    }, "La comisión debe ser un número entre 0 y 100"),
  comisionPlataforma: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === "") return true;
      const num = parseFloat(val);
      return !Number.isNaN(num) && num >= 0 && num <= 100;
    }, "La comisión debe ser un número entre 0 y 100"),
});

export type MetodoPagoFormValues = z.infer<typeof metodoPagoFormSchema>;
