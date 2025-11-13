import { z } from "zod";

export const costCenterFormSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido"),
  descripcion: z.string().optional(),
  responsable: z.string().optional(),
});

export type CostCenterFormValues = z.infer<typeof costCenterFormSchema>;
