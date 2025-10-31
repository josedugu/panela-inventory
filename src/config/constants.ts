export const APP_NAME = "PANELA";
export const APP_DESCRIPTION = "Sistema de gestión de inventario";

export const LOW_STOCK_THRESHOLD = 10;
export const DEFAULT_PAGE_SIZE = 20;

export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  INVENTORY: "/inventory",
  SALES: "/sales",
  CUSTOMERS: "/customers",
  MASTER_DATA: "/master-data",
  NOTIFICATIONS: "/notifications",
  SETTINGS: "/settings",
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
} as const;
