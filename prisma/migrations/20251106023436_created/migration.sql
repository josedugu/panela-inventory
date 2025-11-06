-- CreateTable
CREATE TABLE "dev"."producto_descuento" (
    "id" UUID NOT NULL,
    "nombre" TEXT,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "descuento" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "producto_id" UUID NOT NULL,

    CONSTRAINT "producto_descuento_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "dev"."producto_descuento" ADD CONSTRAINT "producto_descuento_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "dev"."producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
