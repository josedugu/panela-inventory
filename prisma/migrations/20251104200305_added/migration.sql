/*
  Warnings:

  - You are about to drop the column `ubicacion` on the `bodega` table. All the data in the column will be lost.
  - The `estado` column on the `bodega` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `codigo` on the `centro_costo` table. All the data in the column will be lost.
  - You are about to drop the column `anio` on the `modelo` table. All the data in the column will be lost.
  - You are about to drop the column `categoria` on the `modelo` table. All the data in the column will be lost.
  - You are about to drop the `brands` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `empleado` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `perfil` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "dev"."empleado" DROP CONSTRAINT "empleado_centro_costo_id_fkey";

-- DropForeignKey
ALTER TABLE "dev"."modelo" DROP CONSTRAINT "modelo_marca_id_fkey";

-- DropIndex
DROP INDEX "dev"."bodega_codigo_key";

-- DropIndex
DROP INDEX "dev"."centro_costo_codigo_key";

-- AlterTable
ALTER TABLE "bodega" DROP COLUMN "ubicacion",
ALTER COLUMN "codigo" DROP NOT NULL,
DROP COLUMN "estado",
ADD COLUMN     "estado" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "centro_costo" DROP COLUMN "codigo";

-- AlterTable
ALTER TABLE "modelo" DROP COLUMN "anio",
DROP COLUMN "categoria",
ADD COLUMN     "almacenamiento" TEXT,
ADD COLUMN     "color" TEXT,
ADD COLUMN     "ram" TEXT;

-- DropTable
DROP TABLE "dev"."brands";

-- DropTable
DROP TABLE "dev"."empleado";

-- DropTable
DROP TABLE "dev"."perfil";

-- CreateTable
CREATE TABLE "usuario" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "rol_id" UUID,
    "centro_costo_id" UUID,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marca" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "marca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rol" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "rol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipo_producto" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tipo_producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "producto" (
    "id" UUID NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "precio" DECIMAL(10,2) NOT NULL,
    "costo" DECIMAL(10,2) NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 0,
    "imei" TEXT,
    "descripcion" TEXT,
    "tipo_producto_id" UUID,
    "imagen_url" TEXT,
    "marca_id" UUID,
    "modelo_id" UUID,
    "bodega_id" UUID,
    "proveedor_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductoPrecio" (
    "id" UUID NOT NULL,
    "precio" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "producto_id" UUID NOT NULL,

    CONSTRAINT "ProductoPrecio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimiento_inventario" (
    "id" UUID NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 0,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "creado_por_id" UUID,
    "actualizado_por_id" UUID,
    "tipo_movimiento_id" UUID,
    "producto_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "movimiento_inventario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipo_movimiento_inventario" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "ingreso" BOOLEAN NOT NULL DEFAULT false,
    "salida" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tipo_movimiento_inventario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cliente" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "whatsapp" TEXT,
    "direccion" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compra" (
    "id" UUID NOT NULL,
    "cliente_id" UUID,
    "total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "metodo_pago_id" UUID,
    "medio_venta_id" UUID,
    "compraProductoId" UUID NOT NULL,

    CONSTRAINT "compra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompraProducto" (
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

    CONSTRAINT "CompraProducto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metodo_pago" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "metodo_pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medio_venta" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "medio_venta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE INDEX "usuario_centro_costo_id_idx" ON "usuario"("centro_costo_id");

-- CreateIndex
CREATE INDEX "usuario_email_idx" ON "usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "marca_nombre_key" ON "marca"("nombre");

-- CreateIndex
CREATE INDEX "producto_tipo_producto_id_idx" ON "producto"("tipo_producto_id");

-- CreateIndex
CREATE UNIQUE INDEX "movimiento_inventario_producto_id_key" ON "movimiento_inventario"("producto_id");

-- CreateIndex
CREATE UNIQUE INDEX "cliente_email_key" ON "cliente"("email");

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_centro_costo_id_fkey" FOREIGN KEY ("centro_costo_id") REFERENCES "centro_costo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "rol"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modelo" ADD CONSTRAINT "modelo_marca_id_fkey" FOREIGN KEY ("marca_id") REFERENCES "marca"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto" ADD CONSTRAINT "producto_tipo_producto_id_fkey" FOREIGN KEY ("tipo_producto_id") REFERENCES "tipo_producto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto" ADD CONSTRAINT "producto_marca_id_fkey" FOREIGN KEY ("marca_id") REFERENCES "marca"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto" ADD CONSTRAINT "producto_modelo_id_fkey" FOREIGN KEY ("modelo_id") REFERENCES "modelo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto" ADD CONSTRAINT "producto_bodega_id_fkey" FOREIGN KEY ("bodega_id") REFERENCES "bodega"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto" ADD CONSTRAINT "producto_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductoPrecio" ADD CONSTRAINT "ProductoPrecio_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimiento_inventario" ADD CONSTRAINT "movimiento_inventario_creado_por_id_fkey" FOREIGN KEY ("creado_por_id") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimiento_inventario" ADD CONSTRAINT "movimiento_inventario_actualizado_por_id_fkey" FOREIGN KEY ("actualizado_por_id") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimiento_inventario" ADD CONSTRAINT "movimiento_inventario_tipo_movimiento_id_fkey" FOREIGN KEY ("tipo_movimiento_id") REFERENCES "tipo_movimiento_inventario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimiento_inventario" ADD CONSTRAINT "movimiento_inventario_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compra" ADD CONSTRAINT "compra_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compra" ADD CONSTRAINT "compra_metodo_pago_id_fkey" FOREIGN KEY ("metodo_pago_id") REFERENCES "metodo_pago"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compra" ADD CONSTRAINT "compra_medio_venta_id_fkey" FOREIGN KEY ("medio_venta_id") REFERENCES "medio_venta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompraProducto" ADD CONSTRAINT "CompraProducto_compra_id_fkey" FOREIGN KEY ("compra_id") REFERENCES "compra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompraProducto" ADD CONSTRAINT "CompraProducto_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
