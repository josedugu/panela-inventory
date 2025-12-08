-- AlterTable
ALTER TABLE "dev"."comision" ADD COLUMN     "porcentaje" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "dev"."metodo_pago" ADD COLUMN     "comisionPlataforma" DECIMAL(10,2) NOT NULL DEFAULT 0;
