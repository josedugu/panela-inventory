/*
  Warnings:

  - Added the required column `fecha_vigencia` to the `producto_descuento` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "dev"."producto_descuento" ADD COLUMN     "fecha_vigencia" TIMESTAMPTZ(6) NOT NULL;
