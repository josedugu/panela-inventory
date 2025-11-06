/*
  Warnings:

  - You are about to drop the column `imei` on the `producto` table. All the data in the column will be lost.
  - You are about to drop the column `precio` on the `producto` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "dev"."producto" DROP COLUMN "imei",
DROP COLUMN "precio";
