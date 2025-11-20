/*
  Warnings:

  - A unique constraint covering the columns `[cedula]` on the table `cliente` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "dev"."cliente" ADD COLUMN     "cedula" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "cliente_cedula_key" ON "dev"."cliente"("cedula");
