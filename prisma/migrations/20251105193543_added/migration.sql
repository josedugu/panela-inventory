/*
  Warnings:

  - A unique constraint covering the columns `[imei]` on the table `producto_detalle` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "dev"."producto" ADD COLUMN     "almacenamiento_id" UUID,
ADD COLUMN     "color_id" UUID,
ADD COLUMN     "ram_id" UUID;

-- AlterTable
ALTER TABLE "dev"."producto_detalle" ALTER COLUMN "imei" DROP NOT NULL;

-- CreateTable
CREATE TABLE "dev"."almacenamiento" (
    "id" UUID NOT NULL,
    "capacidad" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "almacenamiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dev"."ram" (
    "id" UUID NOT NULL,
    "capacidad" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dev"."color" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "color_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "producto_detalle_imei_key" ON "dev"."producto_detalle"("imei");

-- AddForeignKey
ALTER TABLE "dev"."producto" ADD CONSTRAINT "producto_almacenamiento_id_fkey" FOREIGN KEY ("almacenamiento_id") REFERENCES "dev"."almacenamiento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dev"."producto" ADD CONSTRAINT "producto_ram_id_fkey" FOREIGN KEY ("ram_id") REFERENCES "dev"."ram"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dev"."producto" ADD CONSTRAINT "producto_color_id_fkey" FOREIGN KEY ("color_id") REFERENCES "dev"."color"("id") ON DELETE SET NULL ON UPDATE CASCADE;
