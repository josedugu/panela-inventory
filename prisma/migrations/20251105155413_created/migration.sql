-- CreateTable
CREATE TABLE "dev"."producto_detalle" (
    "id" UUID NOT NULL,
    "imei" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "producto_id" UUID NOT NULL,

    CONSTRAINT "producto_detalle_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "dev"."producto_detalle" ADD CONSTRAINT "producto_detalle_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "dev"."producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
