-- AlterTable
ALTER TABLE "dev"."producto" ADD COLUMN     "precio_oferta" DECIMAL(10,2) DEFAULT 0;

-- AlterTable
ALTER TABLE "dev"."tipo_producto" ADD COLUMN     "productoBaseParaOferta" BOOLEAN NOT NULL DEFAULT false;
