export const MASTER_DATA_SECTIONS = [
  { slug: "proveedores", label: "Proveedores" },
  { slug: "marcas", label: "Marcas" },
  { slug: "modelos", label: "Modelos" },
  { slug: "usuarios", label: "Usuarios" },
  { slug: "centros-costo", label: "Centros de costo" },
  { slug: "bodegas", label: "Bodegas" },
  { slug: "colores", label: "Colores" },
  { slug: "almacenamiento", label: "Almacenamiento" },
  { slug: "ram", label: "RAM" },
] as const;

export type MasterDataSection = (typeof MASTER_DATA_SECTIONS)[number]["slug"];

export const DEFAULT_MASTER_DATA_SECTION: MasterDataSection = "proveedores";
