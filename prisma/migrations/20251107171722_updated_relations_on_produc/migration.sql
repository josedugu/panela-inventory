/*
  Warnings:

  - You are about to drop the column `bodega_id` on the `producto` table. All the data in the column will be lost.
  - You are about to drop the column `proveedor_id` on the `producto` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "dev"."producto" DROP CONSTRAINT "producto_bodega_id_fkey";

-- DropForeignKey
ALTER TABLE "dev"."producto" DROP CONSTRAINT "producto_proveedor_id_fkey";

-- AlterTable
ALTER TABLE "dev"."movimiento_inventario" ADD COLUMN     "bodega_id" UUID,
ADD COLUMN     "proveedor_id" UUID;

-- AlterTable
ALTER TABLE "dev"."producto" DROP COLUMN "bodega_id",
DROP COLUMN "proveedor_id";

-- AddForeignKey
ALTER TABLE "dev"."movimiento_inventario" ADD CONSTRAINT "movimiento_inventario_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "dev"."proveedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dev"."movimiento_inventario" ADD CONSTRAINT "movimiento_inventario_bodega_id_fkey" FOREIGN KEY ("bodega_id") REFERENCES "dev"."bodega"("id") ON DELETE SET NULL ON UPDATE CASCADE;
