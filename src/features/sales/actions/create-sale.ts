"use server";

import { ComisionTipo, Prisma } from "@prisma/client";
import { z } from "zod";
import { createCustomer } from "@/data/repositories/customers.repository";
import { getCurrentUserWithRole } from "@/lib/auth/get-current-user";
import { prisma } from "@/lib/prisma/client";

const saleLineSchema = z.object({
  productId: z.string().min(1, "El producto es requerido"),
  productoDetalleId: z.string().min(1, "El IMEI es requerido").optional(),
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

    if (!currentUser.centroCostoId) {
      return {
        success: false,
        error: "El usuario no tiene un centro de costos asignado",
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

      // Validar reglas de negocio
      const hayProductoBase = products.some(
        (p) => p.tipoProducto?.productoBaseParaOferta === true,
      );

      for (const line of lines) {
        const product = products.find((p) => p.id === line.productId);
        if (!product) continue;

        const costo = product.costo ? Number(product.costo) : 0;
        const precioOferta = product.precioOferta
          ? Number(product.precioOferta)
          : null;
        const pvp = product.pvp ? Number(product.pvp) : 0;
        const esProductoBase =
          product.tipoProducto?.productoBaseParaOferta === true;

        // Determinar si aplica oferta válida para este producto
        const aplicaOfertaValida =
          hayProductoBase && precioOferta !== null && !esProductoBase;

        // Regla 1: Ningún producto puede venderse por debajo del costo
        // EXCEPTO si aplica una oferta válida (tiene precioOferta y hay producto base)
        if (line.unitPrice < costo && costo > 0) {
          // Si aplica oferta válida y el precio es exactamente el de oferta, está permitido
          if (aplicaOfertaValida && line.unitPrice === precioOferta) {
            // OK - oferta válida aplicada
          } else {
            throw new Error(
              `El producto "${product.nombre}" no puede venderse por debajo de su costo ($${costo.toLocaleString()}). Precio enviado: $${line.unitPrice.toLocaleString()}`,
            );
          }
        }

        // Regla 2: Productos con precio de oferta
        if (precioOferta !== null && !esProductoBase) {
          // Si el precio enviado es el de oferta pero no hay producto base, error
          if (line.unitPrice === precioOferta && !hayProductoBase) {
            throw new Error(
              `El producto "${product.nombre}" tiene precio de oferta pero no hay un producto base en la venta. Precio esperado: $${pvp.toLocaleString()}`,
            );
          }
          // Si hay producto base y el precio no es el de oferta, error
          if (hayProductoBase && line.unitPrice !== precioOferta) {
            throw new Error(
              `El producto "${product.nombre}" debe venderse a precio de oferta ($${precioOferta.toLocaleString()}) cuando hay un producto base en la venta`,
            );
          }
        }
      }

      // Resolver productoDetalle(s) y costos por línea antes de crear la venta
      const lineSelections = await Promise.all(
        lines.map(async (line) => {
          const product = products.find((p) => p.id === line.productId);
          if (!product) {
            throw new Error(
              `Producto con id ${line.productId} no encontrado en la carga actual`,
            );
          }

          let detalles: {
            id: string;
            bodegaId: string | null;
          }[] = [];

          if (line.productoDetalleId) {
            const productoDetalle = await tx.productoDetalle.findFirst({
              where: {
                id: line.productoDetalleId,
                estado: true,
                ventaProductoId: null,
                productoId: line.productId,
              },
              select: {
                id: true,
                bodegaId: true,
              },
            });

            if (!productoDetalle) {
              throw new Error(
                `El IMEI seleccionado no está disponible para ${product.nombre ?? product.id}`,
              );
            }

            detalles = [productoDetalle];
          } else {
            const availableDetails = await tx.productoDetalle.findMany({
              where: {
                productoId: line.productId,
                estado: true,
                ventaProductoId: null,
              },
              select: {
                id: true,
                bodegaId: true,
              },
              take: line.quantity,
            });

            if (availableDetails.length < line.quantity) {
              throw new Error(
                `No hay suficientes productos detalles disponibles para ${product.nombre ?? product.id}`,
              );
            }

            detalles = availableDetails;
          }

          const productCost = product.costo ? Number(product.costo) : 0;
          let costoTotal = 0;

          for (const detalle of detalles) {
            const movimientoIngreso = await tx.movimientoInventario.findFirst({
              where: {
                productos: {
                  some: {
                    id: detalle.id,
                  },
                },
                tipoMovimiento: {
                  ingreso: true,
                },
                costoUnitario: {
                  not: null,
                },
              },
              select: {
                costoUnitario: true,
              },
              orderBy: {
                createdAt: "desc",
              },
            });

            const detalleCost = movimientoIngreso?.costoUnitario
              ? Number(movimientoIngreso.costoUnitario)
              : productCost;
            costoTotal += detalleCost;
          }

          const costoUnitario =
            detalles.length > 0 ? costoTotal / detalles.length : 0;

          const esObsequio = line.unitPrice === 0;

          return {
            line,
            detailIds: detalles.map((detalle) => detalle.id),
            costoUnitario,
            costoTotal,
            esObsequio,
            bodegaId: detalles[0]?.bodegaId ?? null,
          };
        }),
      );

      const saleBodegaId =
        lineSelections.find((selection) => selection.bodegaId)?.bodegaId ??
        null;

      if (!saleBodegaId) {
        throw new Error(
          "No se pudo determinar la bodega para la venta. Verifica que los productos detalles tengan bodega asignada.",
        );
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

      // Preparar mapa de métodos de pago con sus comisiones (valores como enteros: 10 = 10%)
      const paymentMethodsMap = new Map<
        string,
        {
          comisionPlataforma: Prisma.Decimal;
          comisionAsesor: Prisma.Decimal;
        }
      >();

      if (payments.length > 0) {
        const paymentMethodIds = [
          ...new Set(payments.map((payment) => payment.methodId)),
        ];

        const metodoPagos = await tx.metodoPago.findMany({
          where: {
            id: {
              in: paymentMethodIds,
            },
            estado: true,
          },
          select: {
            id: true,
            comisionPlataforma: true,
            comisionAsesor: true,
          },
        });

        if (metodoPagos.length !== paymentMethodIds.length) {
          throw new Error(
            "Uno o más métodos de pago no fueron encontrados o están inactivos",
          );
        }

        for (const metodoPago of metodoPagos) {
          paymentMethodsMap.set(metodoPago.id, {
            comisionPlataforma:
              metodoPago.comisionPlataforma ?? new Prisma.Decimal(0),
            comisionAsesor: metodoPago.comisionAsesor ?? new Prisma.Decimal(0),
          });
        }
      }

      // 3. Crear la venta
      const venta = await tx.venta.create({
        data: {
          clienteId: finalCustomerId,
          total: new Prisma.Decimal(total.toString()),
          vendidoPorId: currentUser.id,
          centroCostoId: currentUser.centroCostoId ?? null,
          bodegaId: saleBodegaId,
          ventaProducto: {
            create: lines.map((line, index) => {
              const product = products.find((p) => p.id === line.productId);
              if (!product) {
                throw new Error(
                  `Producto con id ${line.productId} no encontrado en la carga actual`,
                );
              }
              const selection = lineSelections[index];
              if (!selection) {
                throw new Error(
                  `No se pudo resolver costos para el producto ${product.nombre ?? product.id}`,
                );
              }
              const subtotal = line.unitPrice * line.quantity;
              const descuento = 0; // Por ahora sin descuentos
              const lineTotal = subtotal - descuento;

              return {
                cantidad: line.quantity,
                precio: new Prisma.Decimal(line.unitPrice.toString()),
                descuento: new Prisma.Decimal(descuento.toString()),
                subtotal: new Prisma.Decimal(subtotal.toString()),
                total: new Prisma.Decimal(lineTotal.toString()),
                costoUnitario: new Prisma.Decimal(
                  selection.costoUnitario.toString(),
                ),
                costoTotal: new Prisma.Decimal(selection.costoTotal.toString()),
                esObsequio: selection.esObsequio,
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
        const product = products.find((p) => p.id === line.productId);
        if (!product) {
          throw new Error(
            `Producto con id ${line.productId} no encontrado en la carga actual`,
          );
        }

        const selection = lineSelections[index];
        if (!selection) {
          throw new Error(
            `No se pudo resolver producto detalle para ${product.nombre ?? product.id}`,
          );
        }

        const productoDetalleIds = selection.detailIds;

        // Crear movimiento de inventario
        // Para ventas, no necesitamos costo unitario ya que es una salida
        const _movimiento = await tx.movimientoInventario.create({
          data: {
            cantidad: line.quantity,
            tipoMovimientoId: saleMovementType.id,
            creadoPorId: currentUser.id,
            costoUnitario: null, // Las ventas no tienen costo unitario
            productos: {
              connect: productoDetalleIds.map((id) => ({ id })),
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
                connect: productoDetalleIds.map((id) => ({ id })),
              },
            },
          });
        }
      }

      // 5. Crear pagos si se proporcionaron
      if (payments.length > 0) {
        for (const payment of payments) {
          const metodoPago = paymentMethodsMap.get(payment.methodId);

          if (!metodoPago) {
            throw new Error(
              "Método de pago no encontrado para calcular comisiones",
            );
          }

          const amountDecimal = new Prisma.Decimal(payment.amount.toString());

          // Percentages are stored as integers (e.g., 10 = 10%), so divide by 100 when applying.
          const plataformaPct = metodoPago.comisionPlataforma;
          const asesorPct = metodoPago.comisionAsesor;

          const comisionPlataforma = amountDecimal.mul(plataformaPct).div(100);
          const netoDespuesPlataforma = amountDecimal.sub(comisionPlataforma);
          const comisionAsesor = netoDespuesPlataforma.mul(asesorPct).div(100);

          const pago = await tx.pago.create({
            data: {
              ventaId: venta.id,
              metodoPagoId: payment.methodId,
              cantidad: amountDecimal,
            },
          });

          await tx.comision.create({
            data: {
              pagoId: pago.id,
              porcentaje: plataformaPct,
              baseComision: amountDecimal,
              monto: comisionPlataforma,
              tipo: ComisionTipo.PLATAFORMA,
            },
          });

          await tx.comision.create({
            data: {
              pagoId: pago.id,
              porcentaje: asesorPct,
              baseComision: netoDespuesPlataforma,
              monto: comisionAsesor,
              tipo: ComisionTipo.ASESOR,
            },
          });
        }
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
