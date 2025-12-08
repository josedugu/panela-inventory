export const MASTER_DATA_SECTIONS = [
  { slug: "almacenamiento", label: "Almacenamiento" },
  { slug: "bodegas", label: "Bodegas" },
  { slug: "centros-costo", label: "Centros de costo" },
  { slug: "colores", label: "Colores" },
  { slug: "marcas", label: "Marcas" },
  { slug: "metodo-pago", label: "Métodos de Pago" },
  { slug: "modelos", label: "Modelos" },
  { slug: "productos", label: "Productos" },
  { slug: "proveedores", label: "Proveedores" },
  { slug: "ram", label: "RAM" },
  { slug: "tipo-productos", label: "Tipos de Producto" },
  { slug: "usuarios", label: "Usuarios" },
] as const;

export type MasterDataSection = (typeof MASTER_DATA_SECTIONS)[number]["slug"];

export const DEFAULT_MASTER_DATA_SECTION: MasterDataSection = "proveedores";
