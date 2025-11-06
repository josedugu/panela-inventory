/*
  Warnings:

  - A unique constraint covering the columns `[consecutivo]` on the table `venta` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "dev"."bodega" ADD COLUMN     "centro_costo_id" UUID;

-- AlterTable
ALTER TABLE "dev"."venta" ADD COLUMN     "consecutivo" SERIAL NOT NULL,
ADD COLUMN     "vendido_por_id" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "venta_consecutivo_key" ON "dev"."venta"("consecutivo");

-- AddForeignKey
ALTER TABLE "dev"."bodega" ADD CONSTRAINT "bodega_centro_costo_id_fkey" FOREIGN KEY ("centro_costo_id") REFERENCES "dev"."centro_costo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dev"."venta" ADD CONSTRAINT "venta_vendido_por_id_fkey" FOREIGN KEY ("vendido_por_id") REFERENCES "dev"."usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
