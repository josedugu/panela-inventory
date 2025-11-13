import { z } from "zod";

export const ramFormSchema = z.object({
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

export type RamFormValues = z.infer<typeof ramFormSchema>;
