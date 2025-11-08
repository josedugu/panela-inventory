import { z } from "zod";

/**
 * Schema de validación para Producto basado en el modelo Prisma.
 * Coincide exactamente con el modelo Producto en schema.prisma
 */
export const productSchema = z.object({
  // Campos opcionales para creación (el id se genera automáticamente)
  estado: z.boolean().default(true).optional(),
  costo: z.preprocess(
    (val) => {
      if (typeof val === "string") {
        const parsed = parseFloat(val);
        return Number.isNaN(parsed) ? val : parsed;
      }
      return val;
    },
    z
      .number({ required_error: "El costo es requerido" })
      .nonnegative("El costo no puede ser negativo"),
  ),
  cantidad: z.number().int().nonnegative().default(0).optional(),
  descripcion: z.string().optional(),
  tipoProductoId: z.string().uuid("ID de tipo de producto inválido").optional(),
  imagenUrl: z
    .string()
    .url("URL de imagen inválida")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  marcaId: z.string().uuid("ID de marca inválido").optional(),
  modeloId: z.string().uuid("ID de modelo inválido").optional(),
  almacenamientoId: z.string().uuid("ID de almacenamiento inválido").optional(),
  ramId: z.string().uuid("ID de RAM inválido").optional(),
  colorId: z.string().uuid("ID de color inválido").optional(),
});

export type ProductInput = z.infer<typeof productSchema>;

/**
 * Schema para actualización de productos.
 * Todos los campos son opcionales excepto que se mantienen las validaciones.
 */
export const updateProductSchema = productSchema.partial();

export type ProductUpdate = z.infer<typeof updateProductSchema>;
