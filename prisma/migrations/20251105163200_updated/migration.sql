/*
  Warnings:

  - You are about to drop the `compra` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `compra_producto` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "dev"."compra" DROP CONSTRAINT "compra_cliente_id_fkey";

-- DropForeignKey
ALTER TABLE "dev"."compra" DROP CONSTRAINT "compra_medio_venta_id_fkey";

-- DropForeignKey
ALTER TABLE "dev"."compra" DROP CONSTRAINT "compra_metodo_pago_id_fkey";

-- DropForeignKey
ALTER TABLE "dev"."compra_producto" DROP CONSTRAINT "compra_producto_compra_id_fkey";

-- DropForeignKey
ALTER TABLE "dev"."compra_producto" DROP CONSTRAINT "compra_producto_producto_id_fkey";

-- DropForeignKey
ALTER TABLE "dev"."movimiento_inventario" DROP CONSTRAINT "movimiento_inventario_producto_id_fkey";

-- AlterTable
ALTER TABLE "dev"."producto_detalle" ADD COLUMN     "estado" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "nombre" TEXT,
ADD COLUMN     "venta_producto_id" UUID;

-- DropTable
DROP TABLE "dev"."compra";

-- DropTable
DROP TABLE "dev"."compra_producto";

-- CreateTable
CREATE TABLE "dev"."venta" (
    "id" UUID NOT NULL,
    "cliente_id" UUID,
    "total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "metodo_pago_id" UUID,
    "medio_venta_id" UUID,

    CONSTRAINT "venta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dev"."venta_producto" (
    "id" UUID NOT NULL,
    "venta_id" UUID NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 0,
    "precio" DECIMAL(10,2) NOT NULL,
    "descuento" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "venta_producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dev"."_MovimientoInventarioToProductoDetalle" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_MovimientoInventarioToProductoDetalle_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_MovimientoInventarioToProductoDetalle_B_index" ON "dev"."_MovimientoInventarioToProductoDetalle"("B");

-- AddForeignKey
ALTER TABLE "dev"."producto_detalle" ADD CONSTRAINT "producto_detalle_venta_producto_id_fkey" FOREIGN KEY ("venta_producto_id") REFERENCES "dev"."venta_producto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dev"."venta" ADD CONSTRAINT "venta_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "dev"."cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dev"."venta" ADD CONSTRAINT "venta_metodo_pago_id_fkey" FOREIGN KEY ("metodo_pago_id") REFERENCES "dev"."metodo_pago"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dev"."venta" ADD CONSTRAINT "venta_medio_venta_id_fkey" FOREIGN KEY ("medio_venta_id") REFERENCES "dev"."medio_venta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dev"."venta_producto" ADD CONSTRAINT "venta_producto_venta_id_fkey" FOREIGN KEY ("venta_id") REFERENCES "dev"."venta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dev"."_MovimientoInventarioToProductoDetalle" ADD CONSTRAINT "_MovimientoInventarioToProductoDetalle_A_fkey" FOREIGN KEY ("A") REFERENCES "dev"."movimiento_inventario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dev"."_MovimientoInventarioToProductoDetalle" ADD CONSTRAINT "_MovimientoInventarioToProductoDetalle_B_fkey" FOREIGN KEY ("B") REFERENCES "dev"."producto_detalle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
