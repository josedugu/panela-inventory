"use server";

import { Prisma } from "@prisma/client";
import { z } from "zod";
import { createCustomer } from "@/data/repositories/customers.repository";
import { getCurrentUserWithRole } from "@/lib/auth/get-current-user";
import { prisma } from "@/lib/prisma/client";

const saleLineSchema = z.object({
  productId: z.string().min(1, "El producto es requerido"),
  quantity: z.number().int().positive("La cantidad debe ser mayor a 0"),
  unitPrice: z.number().nonnegative("El precio no puede ser negativo"),
});

const customerDataSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  email: z.string().email("Correo inválido"),
  telefono: z.string().optional(),
  whatsapp: z.string().optional(),
  direccion: z.string().optional(),
});

const paymentSchema = z.object({
  methodId: z.string().min(1, "Método de pago requerido"),
  amount: z.number().positive("El monto debe ser mayor a 0"),
});

const createSaleSchema = z.object({
  customerId: z.string().optional(),
  customerData: customerDataSchema.optional(),
  lines: z.array(saleLineSchema).min(1, "Debe haber al menos un producto"),
  payments: z.array(paymentSchema).optional(),
});

export type CreateSaleInput = z.infer<typeof createSaleSchema>;

export type CreateSaleResult =
  | { success: true; saleId: string }
  | { success: false; error: string; errors?: Record<string, string[]> };

export async function createSaleAction(
  data: CreateSaleInput,
): Promise<CreateSaleResult> {
  try {
    // Validar datos
    const parsed = createSaleSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: "Datos inválidos",
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const { customerId, customerData, lines, payments = [] } = parsed.data;

    // Obtener usuario actual
    const currentUser = await getCurrentUserWithRole();
    if (!currentUser) {
      return {
        success: false,
        error: "Usuario no autenticado",
      };
    }

    // Obtener o crear tipo de movimiento de salida (venta)
    // Buscar un tipo de movimiento de salida existente
    let saleMovementType = await prisma.tipoMovimientoInventario.findFirst({
      where: {
        salida: true,
        nombre: {
          contains: "venta",
          mode: "insensitive",
        },
      },
    });

    // Si no existe, crear uno por defecto
    if (!saleMovementType) {
      saleMovementType = await prisma.tipoMovimientoInventario.create({
        data: {
          nombre: "Venta",
          ingreso: false,
          salida: true,
        },
      });
    }

    // Ejecutar en transacción
    return await prisma.$transaction(async (tx) => {
      // 1. Crear o obtener cliente
      let finalCustomerId = customerId;

      if (!finalCustomerId && customerData) {
        // Verificar si el cliente ya existe por email
        const existingCustomer = await tx.cliente.findUnique({
          where: { email: customerData.email },
        });

        if (existingCustomer) {
          finalCustomerId = existingCustomer.id;
        } else {
          // Crear nuevo cliente
          const newCustomer = await createCustomer(customerData);
          finalCustomerId = newCustomer.id;
        }
      }

      if (!finalCustomerId) {
        throw new Error("Cliente es requerido");
      }

      // 2. Validar productos y calcular totales
      const productIds = lines.map((line) => line.productId);
      const products = await tx.producto.findMany({
        where: {
          id: { in: productIds },
          estado: true,
        },
        include: {
          tipoProducto: {
            select: {
              productoBaseParaOferta: true,
            },
          },
        },
      });

      if (products.length !== productIds.length) {
        throw new Error("Uno o más productos no fueron encontrados");
      }

      // Validar cantidades disponibles
      for (const line of lines) {
        const product = products.find((p) => p.id === line.productId);
        if (!product) {
          throw new Error(`Producto ${line.productId} no encontrado`);
        }
        if (product.cantidad < line.quantity) {
          throw new Error(
            `Cantidad insuficiente para el producto ${product.nombre ?? product.id}. Disponible: ${product.cantidad}, Solicitado: ${line.quantity}`,
          );
        }
      }

      // Validar regla de negocio: precio de oferta solo si hay producto base
      const hayProductoBase = products.some(
        (p) => p.tipoProducto?.productoBaseParaOferta === true,
      );

      for (const line of lines) {
        const product = products.find((p) => p.id === line.productId);
        if (!product) continue;

        const precioOferta = product.precioOferta
          ? Number(product.precioOferta)
          : null;
        const pvp = product.pvp ? Number(product.pvp) : 0;
        const esProductoBase =
          product.tipoProducto?.productoBaseParaOferta === true;

        // Si el producto tiene precio de oferta configurado y no es producto base
        if (precioOferta !== null && !esProductoBase) {
          // Si el precio enviado es el de oferta pero no hay producto base, error
          if (line.unitPrice === precioOferta && !hayProductoBase) {
            throw new Error(
              `El producto "${product.nombre}" tiene precio de oferta pero no hay un producto base en la venta. Precio esperado: $${pvp}`,
            );
          }
          // Si hay producto base y el precio no es el de oferta, advertencia/error
          if (hayProductoBase && line.unitPrice !== precioOferta) {
            throw new Error(
              `El producto "${product.nombre}" debe venderse a precio de oferta ($${precioOferta}) cuando hay un producto base en la venta`,
            );
          }
        }
      }

      // Calcular total de la venta
      const total = lines.reduce(
        (sum, line) => sum + line.unitPrice * line.quantity,
        0,
      );

      // Validar pagos si se proporcionaron
      if (payments.length > 0) {
        const totalPaid = payments.reduce(
          (sum, payment) => sum + payment.amount,
          0,
        );
        if (Math.abs(total - totalPaid) > 0.01) {
          throw new Error(
            `El total de pagos (${totalPaid.toFixed(2)}) no coincide con el total de la venta (${total.toFixed(2)})`,
          );
        }
      }

      // 3. Crear la venta
      const venta = await tx.venta.create({
        data: {
          clienteId: finalCustomerId,
          total: new Prisma.Decimal(total.toString()),
          vendidoPorId: currentUser.id,
          ventaProducto: {
            create: lines.map((line) => {
              const _product = products.find((p) => p.id === line.productId)!;
              const subtotal = line.unitPrice * line.quantity;
              const descuento = 0; // Por ahora sin descuentos
              const lineTotal = subtotal - descuento;

              return {
                cantidad: line.quantity,
                precio: new Prisma.Decimal(line.unitPrice.toString()),
                descuento: new Prisma.Decimal(descuento.toString()),
                subtotal: new Prisma.Decimal(subtotal.toString()),
                total: new Prisma.Decimal(lineTotal.toString()),
                // Obtener productos detalles disponibles para este producto
                productosDetalles: {
                  connect: [], // Se conectará después de crear el movimiento
                },
              };
            }),
          },
        },
        include: {
          ventaProducto: true,
        },
      });

      // 4. Crear movimientos de inventario y conectar productos detalles
      for (const [index, line] of lines.entries()) {
        const product = products.find((p) => p.id === line.productId)!;

        // Obtener productos detalles disponibles (sin venta asignada)
        const availableDetails = await tx.productoDetalle.findMany({
          where: {
            productoId: line.productId,
            estado: true,
            ventaProductoId: null,
          },
          take: line.quantity,
        });

        if (availableDetails.length < line.quantity) {
          throw new Error(
            `No hay suficientes productos detalles disponibles para ${product.nombre ?? product.id}`,
          );
        }

        // Crear movimiento de inventario
        // Para ventas, no necesitamos costo unitario ya que es una salida
        const _movimiento = await tx.movimientoInventario.create({
          data: {
            cantidad: line.quantity,
            tipoMovimientoId: saleMovementType.id,
            creadoPorId: currentUser.id,
            costoUnitario: null, // Las ventas no tienen costo unitario
            productos: {
              connect: availableDetails.map((detail) => ({ id: detail.id })),
            },
          },
        });

        // Actualizar cantidad del producto
        await tx.producto.update({
          where: { id: line.productId },
          data: {
            cantidad: {
              decrement: line.quantity,
            },
          },
        });

        // Conectar productos detalles a la venta
        const ventaProducto = venta.ventaProducto[index];
        if (ventaProducto) {
          await tx.ventaProducto.update({
            where: { id: ventaProducto.id },
            data: {
              productosDetalles: {
                connect: availableDetails.map((detail) => ({ id: detail.id })),
              },
            },
          });
        }
      }

      // 5. Crear pagos si se proporcionaron
      if (payments.length > 0) {
        await tx.pago.createMany({
          data: payments.map((payment) => ({
            ventaId: venta.id,
            metodoPagoId: payment.methodId,
            cantidad: new Prisma.Decimal(payment.amount.toString()),
          })),
        });
      }

      return {
        success: true,
        saleId: venta.id,
      };
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al crear la venta",
    };
  }
}
