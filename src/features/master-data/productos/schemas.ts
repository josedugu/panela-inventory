import { z } from "zod";

export const productFormSchema = z.object({
  tipoProductoId: z.string().uuid("Selecciona un tipo de producto válido"),
  marcaId: z.string().uuid("Selecciona una marca válida"),
  modeloId: z.string().uuid("Selecciona un modelo válido").optional(),
  almacenamientoIds: z.array(z.string().uuid()).optional(), // Array para UI multiselect
  ramIds: z.array(z.string().uuid()).optional(), // Array para UI multiselect
  colorIds: z.array(z.string().uuid()).optional(), // Array para UI multiselect
  pvp: z
    .string()
    .min(1, "El PVP es obligatorio")
    .refine(
      (val) => {
        const num = Number.parseFloat(val);
        return !Number.isNaN(num) && num > 0;
      },
      { message: "El PVP debe ser un número válido mayor a 0" },
    ),
  precioOferta: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === "") return true;
        const num = Number.parseFloat(val);
        return !Number.isNaN(num) && num >= 0;
      },
      { message: "El precio de oferta debe ser un número válido >= 0" },
    ),
  descripcion: z.string().optional(),
  estado: z.boolean(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
