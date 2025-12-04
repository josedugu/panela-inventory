/*
  Warnings:

  - A unique constraint covering the columns `[consecutivo]` on the table `pago` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "dev"."pago" ADD COLUMN     "consecutivo" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "pago_consecutivo_key" ON "dev"."pago"("consecutivo");
