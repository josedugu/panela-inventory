/*
  Warnings:

  - You are about to drop the `CompraProducto` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductoPrecio` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "dev"."CompraProducto" DROP CONSTRAINT "CompraProducto_compra_id_fkey";

-- DropForeignKey
ALTER TABLE "dev"."CompraProducto" DROP CONSTRAINT "CompraProducto_producto_id_fkey";

-- DropForeignKey
ALTER TABLE "dev"."ProductoPrecio" DROP CONSTRAINT "ProductoPrecio_producto_id_fkey";

-- DropTable
DROP TABLE "dev"."CompraProducto";

-- DropTable
DROP TABLE "dev"."ProductoPrecio";

-- CreateTable
CREATE TABLE "producto_precio" (
    "id" UUID NOT NULL,
    "precio" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "producto_id" UUID NOT NULL,

    CONSTRAINT "producto_precio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compra_producto" (
    "id" UUID NOT NULL,
    "compra_id" UUID NOT NULL,
    "producto_id" UUID NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 0,
    "precio" DECIMAL(10,2) NOT NULL,
    "descuento" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "compra_producto_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "producto_precio" ADD CONSTRAINT "producto_precio_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compra_producto" ADD CONSTRAINT "compra_producto_compra_id_fkey" FOREIGN KEY ("compra_id") REFERENCES "compra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compra_producto" ADD CONSTRAINT "compra_producto_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
