/*
  Warnings:

  - You are about to drop the column `pvp` on the `movimiento_inventario` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "dev"."movimiento_inventario" DROP COLUMN "pvp";

-- AlterTable
ALTER TABLE "dev"."producto" ADD COLUMN     "pvp" DECIMAL(10,2) DEFAULT 0;
