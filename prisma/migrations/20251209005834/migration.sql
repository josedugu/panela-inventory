-- CreateEnum
CREATE TYPE "dev"."comision_tipo" AS ENUM ('ASESOR', 'PLATAFORMA');

-- AlterTable
ALTER TABLE "dev"."comision" ADD COLUMN     "baseComision" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "tipo" "dev"."comision_tipo" NOT NULL DEFAULT 'ASESOR';

-- AlterTable
ALTER TABLE "dev"."venta" ADD COLUMN     "bodega_id" UUID,
ADD COLUMN     "centro_costo_id" UUID;

-- AlterTable
ALTER TABLE "dev"."venta_producto" ADD COLUMN     "costo_total" DECIMAL(10,2) DEFAULT 0,
ADD COLUMN     "costo_unitario" DECIMAL(10,2) DEFAULT 0,
ADD COLUMN     "esObsequio" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "venta_centro_costo_id_idx" ON "dev"."venta"("centro_costo_id");

-- AddForeignKey
ALTER TABLE "dev"."venta" ADD CONSTRAINT "venta_centro_costo_id_fkey" FOREIGN KEY ("centro_costo_id") REFERENCES "dev"."centro_costo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dev"."venta" ADD CONSTRAINT "venta_bodega_id_fkey" FOREIGN KEY ("bodega_id") REFERENCES "dev"."bodega"("id") ON DELETE SET NULL ON UPDATE CASCADE;
