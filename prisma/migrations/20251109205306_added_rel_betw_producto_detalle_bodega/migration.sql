/*
  Warnings:

  - You are about to drop the column `capacidad` on the `bodega` table. All the data in the column will be lost.
  - You are about to drop the column `responsable` on the `bodega` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[consecutivo]` on the table `movimiento_inventario` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "dev"."bodega" DROP COLUMN "capacidad",
DROP COLUMN "responsable";

-- AlterTable
ALTER TABLE "dev"."movimiento_inventario" ADD COLUMN     "consecutivo" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "dev"."producto_detalle" ADD COLUMN     "bodega_id" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "movimiento_inventario_consecutivo_key" ON "dev"."movimiento_inventario"("consecutivo");

-- AddForeignKey
ALTER TABLE "dev"."producto_detalle" ADD CONSTRAINT "producto_detalle_bodega_id_fkey" FOREIGN KEY ("bodega_id") REFERENCES "dev"."bodega"("id") ON DELETE SET NULL ON UPDATE CASCADE;
