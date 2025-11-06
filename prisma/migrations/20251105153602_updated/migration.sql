/*
  Warnings:

  - You are about to drop the column `compraProductoId` on the `compra` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "dev"."compra" DROP COLUMN "compraProductoId";

-- AlterTable
ALTER TABLE "dev"."producto" ALTER COLUMN "precio" DROP NOT NULL,
ALTER COLUMN "costo" DROP NOT NULL;
