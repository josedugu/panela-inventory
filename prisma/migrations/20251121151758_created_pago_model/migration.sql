/*
  Warnings:

  - You are about to drop the column `metodo_pago_id` on the `venta` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "dev"."venta" DROP CONSTRAINT "venta_metodo_pago_id_fkey";

-- AlterTable
ALTER TABLE "dev"."venta" DROP COLUMN "metodo_pago_id";

-- CreateTable
CREATE TABLE "dev"."pago" (
    "id" UUID NOT NULL,
    "cantidad" DECIMAL(10,2) NOT NULL,
    "metodo_pago_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "venta_id" UUID NOT NULL,

    CONSTRAINT "pago_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "dev"."pago" ADD CONSTRAINT "pago_metodo_pago_id_fkey" FOREIGN KEY ("metodo_pago_id") REFERENCES "dev"."metodo_pago"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dev"."pago" ADD CONSTRAINT "pago_venta_id_fkey" FOREIGN KEY ("venta_id") REFERENCES "dev"."venta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
