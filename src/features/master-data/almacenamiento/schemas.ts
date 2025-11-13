import { z } from "zod";

export const storageFormSchema = z.object({
  capacidad: z
    .string()
    .min(1, "Capacidad requerida")
    .refine(
      (val) => {
        const num = Number.parseInt(val, 10);
        return !Number.isNaN(num) && num > 0;
      },
      { message: "La capacidad debe ser un número positivo" },
    ),
});

export type StorageFormValues = z.infer<typeof storageFormSchema>;
