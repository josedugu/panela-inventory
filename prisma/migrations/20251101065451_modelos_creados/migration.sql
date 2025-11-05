/*
  Warnings:

  - You are about to drop the `profile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "dev"."profile";

-- CreateTable
CREATE TABLE "perfil" (
    "id" UUID NOT NULL,
    "full_name" TEXT,
    "avatar_url" TEXT,
    "company" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "perfil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proveedor" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "contacto" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "direccion" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "proveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brands" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "pais" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modelo" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "marca_id" UUID NOT NULL,
    "categoria" TEXT,
    "anio" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "modelo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "centro_costo" (
    "id" UUID NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "responsable" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "centro_costo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "empleado" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "rol" TEXT,
    "centro_costo_id" UUID,
    "estado" TEXT NOT NULL DEFAULT 'Activo',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "empleado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bodega" (
    "id" UUID NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "ubicacion" TEXT NOT NULL,
    "capacidad" TEXT,
    "responsable" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'Activa',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "bodega_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "brands_nombre_key" ON "brands"("nombre");

-- CreateIndex
CREATE INDEX "modelo_marca_id_idx" ON "modelo"("marca_id");

-- CreateIndex
CREATE UNIQUE INDEX "centro_costo_codigo_key" ON "centro_costo"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "empleado_email_key" ON "empleado"("email");

-- CreateIndex
CREATE INDEX "empleado_centro_costo_id_idx" ON "empleado"("centro_costo_id");

-- CreateIndex
CREATE INDEX "empleado_email_idx" ON "empleado"("email");

-- CreateIndex
CREATE UNIQUE INDEX "bodega_codigo_key" ON "bodega"("codigo");

-- AddForeignKey
ALTER TABLE "modelo" ADD CONSTRAINT "modelo_marca_id_fkey" FOREIGN KEY ("marca_id") REFERENCES "brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "empleado" ADD CONSTRAINT "empleado_centro_costo_id_fkey" FOREIGN KEY ("centro_costo_id") REFERENCES "centro_costo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
