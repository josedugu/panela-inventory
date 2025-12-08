-- AlterTable
ALTER TABLE "dev"."metodo_pago" ADD COLUMN     "comisionAsesor" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "esCredito" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "estado" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "dev"."comision" (
    "id" UUID NOT NULL,
    "consecutivo" SERIAL NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "pago_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "comision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "comision_consecutivo_key" ON "dev"."comision"("consecutivo");

-- CreateIndex
CREATE INDEX "movimiento_inventario_tipo_movimiento_id_idx" ON "dev"."movimiento_inventario"("tipo_movimiento_id");

-- CreateIndex
CREATE INDEX "movimiento_inventario_bodega_id_idx" ON "dev"."movimiento_inventario"("bodega_id");

-- CreateIndex
CREATE INDEX "movimiento_inventario_proveedor_id_idx" ON "dev"."movimiento_inventario"("proveedor_id");

-- CreateIndex
CREATE INDEX "movimiento_inventario_creado_por_id_idx" ON "dev"."movimiento_inventario"("creado_por_id");

-- CreateIndex
CREATE INDEX "movimiento_inventario_created_at_idx" ON "dev"."movimiento_inventario"("created_at");

-- CreateIndex
CREATE INDEX "movimiento_inventario_estado_idx" ON "dev"."movimiento_inventario"("estado");

-- AddForeignKey
ALTER TABLE "dev"."comision" ADD CONSTRAINT "comision_pago_id_fkey" FOREIGN KEY ("pago_id") REFERENCES "dev"."pago"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
