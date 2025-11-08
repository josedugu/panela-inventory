/*
  Warnings:

  - A unique constraint covering the columns `[nombre]` on the table `rol` will be added. If there are existing duplicate values, this will fail.
  - Made the column `codigo` on table `bodega` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "dev"."almacenamiento" ALTER COLUMN "capacidad" DROP DEFAULT;

-- AlterTable
ALTER TABLE "dev"."bodega" ALTER COLUMN "codigo" SET NOT NULL;

-- AlterTable
ALTER TABLE "dev"."ram" ALTER COLUMN "capacidad" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "rol_nombre_key" ON "dev"."rol"("nombre");
