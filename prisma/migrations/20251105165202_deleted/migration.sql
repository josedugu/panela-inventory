/*
  Warnings:

  - You are about to drop the column `producto_id` on the `movimiento_inventario` table. All the data in the column will be lost.
  - You are about to drop the `producto_precio` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "dev"."producto_precio" DROP CONSTRAINT "producto_precio_producto_id_fkey";

-- DropIndex
DROP INDEX "dev"."movimiento_inventario_producto_id_key";

-- AlterTable
ALTER TABLE "dev"."movimiento_inventario" DROP COLUMN "producto_id",
ADD COLUMN     "costo_unitario" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "dev"."producto_precio";
