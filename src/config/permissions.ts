/**
 * Configuración de permisos basada en roles
 *
 * Este archivo centraliza la lógica de permisos usando constantes TypeScript.
 * Los permisos se definen por ruta y rol, sin necesidad de base de datos adicional.
 */

export const ROLES = {
  ADMIN: "admin",
  ASESOR: "asesor",
  COLABORADOR: "colaborador",
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

/**
 * Mapeo de rutas a roles permitidos
 * Las rutas deben coincidir exactamente con los pathnames de Next.js
 */
export const ROUTE_PERMISSIONS: Record<string, RoleName[]> = {
  // Dashboard principal
  "/dashboard": [ROLES.ADMIN, ROLES.ASESOR, ROLES.COLABORADOR],

  // Analíticas
  "/dashboard/analytics": [ROLES.ADMIN, ROLES.ASESOR],

  // Clientes
  "/dashboard/customers": [ROLES.ADMIN, ROLES.ASESOR, ROLES.COLABORADOR],

  // Inventario - Vista general
  "/dashboard/inventory": [ROLES.ADMIN, ROLES.ASESOR, ROLES.COLABORADOR],

  // Inventario - Gestión
  "/dashboard/inventory/manage": [ROLES.ADMIN, ROLES.COLABORADOR],

  // Inventario - Movimientos
  "/dashboard/inventory/movements": [ROLES.ADMIN, ROLES.COLABORADOR],

  // Datos Maestros - Vista general
  "/dashboard/master-data": [ROLES.ADMIN],

  // Datos Maestros - Secciones específicas
  "/dashboard/master-data/almacenamiento": [ROLES.ADMIN],
  "/dashboard/master-data/bodegas": [ROLES.ADMIN],
  "/dashboard/master-data/centros-costo": [ROLES.ADMIN],
  "/dashboard/master-data/colores": [ROLES.ADMIN],
  "/dashboard/master-data/marcas": [ROLES.ADMIN],
  "/dashboard/master-data/modelos": [ROLES.ADMIN],
  "/dashboard/master-data/productos": [ROLES.ADMIN],
  "/dashboard/master-data/proveedores": [ROLES.ADMIN],
  "/dashboard/master-data/ram": [ROLES.ADMIN],
  "/dashboard/master-data/tipo-productos": [ROLES.ADMIN],
  "/dashboard/master-data/usuarios": [ROLES.ADMIN],

  // Notificaciones
  "/dashboard/notifications": [ROLES.ADMIN, ROLES.ASESOR, ROLES.COLABORADOR],

  // Reportes
  "/dashboard/reports": [ROLES.ADMIN, ROLES.ASESOR],

  // Ventas
  "/dashboard/sales": [ROLES.ADMIN, ROLES.ASESOR],

  // Configuración
  "/dashboard/settings": [ROLES.ADMIN],
};

/**
 * Acciones específicas por ruta y rol
 * Permite definir permisos granulares como "edit_price", "edit_client", etc.
 */
export const ACTION_PERMISSIONS: Record<string, Record<RoleName, string[]>> = {
  // Dashboard principal - solo lectura
  "/dashboard": {
    [ROLES.ADMIN]: ["view"],
    [ROLES.ASESOR]: ["view"],
    [ROLES.COLABORADOR]: ["view"],
  },

  // Analíticas - solo lectura
  "/dashboard/analytics": {
    [ROLES.ADMIN]: ["view"],
    [ROLES.ASESOR]: ["view"],
    [ROLES.COLABORADOR]: [],
  },

  // Clientes - CRUD completo
  "/dashboard/customers": {
    [ROLES.ADMIN]: ["view", "create", "update", "delete"],
    [ROLES.ASESOR]: ["view", "create", "update"],
    [ROLES.COLABORADOR]: ["view"],
  },

  // Inventario - Vista general - solo lectura
  "/dashboard/inventory": {
    [ROLES.ADMIN]: ["view"],
    [ROLES.ASESOR]: ["view"],
    [ROLES.COLABORADOR]: ["view"],
  },

  // Inventario - Gestión - CRUD completo
  "/dashboard/inventory/manage": {
    [ROLES.ADMIN]: ["view", "create", "update", "delete"],
    [ROLES.ASESOR]: [],
    [ROLES.COLABORADOR]: ["view", "create", "update", "delete"],
  },

  // Inventario - Movimientos - crear y ver
  "/dashboard/inventory/movements": {
    [ROLES.ADMIN]: ["view", "create"],
    [ROLES.ASESOR]: [],
    [ROLES.COLABORADOR]: ["view", "create"],
  },

  // Datos Maestros - Vista general - solo admin
  "/dashboard/master-data": {
    [ROLES.ADMIN]: ["view"],
    [ROLES.ASESOR]: [],
    [ROLES.COLABORADOR]: [],
  },

  // Datos Maestros - Almacenamiento - CRUD completo solo admin
  "/dashboard/master-data/almacenamiento": {
    [ROLES.ADMIN]: ["view", "create", "update", "delete"],
    [ROLES.ASESOR]: [],
    [ROLES.COLABORADOR]: [],
  },

  // Datos Maestros - Bodegas - CRUD completo solo admin
  "/dashboard/master-data/bodegas": {
    [ROLES.ADMIN]: ["view", "create", "update", "delete"],
    [ROLES.ASESOR]: [],
    [ROLES.COLABORADOR]: [],
  },

  // Datos Maestros - Centros de Costo - CRUD completo solo admin
  "/dashboard/master-data/centros-costo": {
    [ROLES.ADMIN]: ["view", "create", "update", "delete"],
    [ROLES.ASESOR]: [],
    [ROLES.COLABORADOR]: [],
  },

  // Datos Maestros - Colores - CRUD completo solo admin
  "/dashboard/master-data/colores": {
    [ROLES.ADMIN]: ["view", "create", "update", "delete"],
    [ROLES.ASESOR]: [],
    [ROLES.COLABORADOR]: [],
  },

  // Datos Maestros - Marcas - CRUD completo solo admin
  "/dashboard/master-data/marcas": {
    [ROLES.ADMIN]: ["view", "create", "update", "delete"],
    [ROLES.ASESOR]: [],
    [ROLES.COLABORADOR]: [],
  },

  // Datos Maestros - Modelos - CRUD completo solo admin
  "/dashboard/master-data/modelos": {
    [ROLES.ADMIN]: ["view", "create", "update", "delete"],
    [ROLES.ASESOR]: [],
    [ROLES.COLABORADOR]: [],
  },

  // Datos Maestros - Productos - CRUD completo solo admin
  "/dashboard/master-data/productos": {
    [ROLES.ADMIN]: ["view", "create", "update", "delete"],
    [ROLES.ASESOR]: [],
    [ROLES.COLABORADOR]: [],
  },

  // Datos Maestros - Proveedores - CRUD completo solo admin
  "/dashboard/master-data/proveedores": {
    [ROLES.ADMIN]: ["view", "create", "update", "delete"],
    [ROLES.ASESOR]: [],
    [ROLES.COLABORADOR]: [],
  },

  // Datos Maestros - RAM - CRUD completo solo admin
  "/dashboard/master-data/ram": {
    [ROLES.ADMIN]: ["view", "create", "update", "delete"],
    [ROLES.ASESOR]: [],
    [ROLES.COLABORADOR]: [],
  },

  // Datos Maestros - Tipos de Producto - CRUD completo solo admin
  "/dashboard/master-data/tipo-productos": {
    [ROLES.ADMIN]: ["view", "create", "update", "delete"],
    [ROLES.ASESOR]: [],
    [ROLES.COLABORADOR]: [],
  },

  // Datos Maestros - Usuarios - CRUD completo solo admin
  "/dashboard/master-data/usuarios": {
    [ROLES.ADMIN]: ["view", "create", "update", "delete"],
    [ROLES.ASESOR]: [],
    [ROLES.COLABORADOR]: [],
  },

  // Notificaciones - solo lectura
  "/dashboard/notifications": {
    [ROLES.ADMIN]: ["view"],
    [ROLES.ASESOR]: ["view"],
    [ROLES.COLABORADOR]: ["view"],
  },

  // Reportes - solo lectura
  "/dashboard/reports": {
    [ROLES.ADMIN]: ["view"],
    [ROLES.ASESOR]: ["view"],
    [ROLES.COLABORADOR]: [],
  },

  // Ventas - permisos granulares
  "/dashboard/sales": {
    [ROLES.ADMIN]: [
      "view",
      "create",
      "update",
      "delete",
      "edit_client",
      "edit_price",
    ],
    [ROLES.ASESOR]: ["view", "create", "update", "edit_client", "edit_price"],
    [ROLES.COLABORADOR]: [],
  },

  // Configuración - solo admin
  "/dashboard/settings": {
    [ROLES.ADMIN]: ["view", "update"],
    [ROLES.ASESOR]: [],
    [ROLES.COLABORADOR]: [],
  },
};

// Re-exportar funciones de validación para facilitar importaciones
export { canAccessRoute } from "./canAccessRoute";
export { canPerformAction } from "./canPerformAction";
