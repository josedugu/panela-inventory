export interface InventoryControlStats {
  totalCosto: number;
  totalPvp: number;
}

export interface InventoryControlProduct {
  id: string;
  nombre: string;
  costo: number;
  pvp: number;
  // Cantidad por bodega - solo las bodegas que el usuario puede ver
  bodegas: InventoryControlBodega[];
}

export interface InventoryControlBodega {
  id: string;
  nombre: string;
  cantidad: number;
  isPhysical: boolean; // Si existe físicamente (último movimiento no es salida)
}

export interface InventoryControlTableRow {
  producto: InventoryControlProduct;
  // Mapa de bodegaId -> cantidad para facilitar renderizado
  cantidadesPorBodega: Record<string, number>;
  // Lista de bodegas ordenadas para headers
  bodegas: InventoryControlBodega[];
}

export interface InventoryControlData {
  stats: InventoryControlStats;
  products: InventoryControlProduct[];
  bodegas: InventoryControlBodega[]; // Lista de todas las bodegas accesibles
}

export interface ImeiItem {
  id: string;
  imei: string | null;
}

export interface ExportInventoryItem {
  nombre: string;
  imei: string;
  bodega: string;
}
