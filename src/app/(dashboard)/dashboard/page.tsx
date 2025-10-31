import { getDashboardMetrics } from "@/data/queries/dashboard.queries";

export default async function DashboardPage() {
  // Intentar obtener métricas reales, si falla usar datos mock
  let metrics;
  let isDemo = false;
  
  try {
    metrics = await getDashboardMetrics();
  } catch (error) {
    // Si Supabase no está configurado, usar datos de demostración
    isDemo = true;
    metrics = {
      totalProducts: 8,
      totalStock: 530,
      lowStockCount: 2,
      inventoryValue: 2450.85,
    };
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        {isDemo && (
          <div className="px-3 py-1 bg-warning-light border border-warning-border rounded-md">
            <p className="text-xs font-medium text-warning-foreground">
              📊 Modo Demo - Datos de ejemplo
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-1 p-6 rounded-lg border border-border">
          <p className="text-sm text-text-secondary">Total Productos</p>
          <p className="text-3xl font-semibold mt-2">{metrics.totalProducts}</p>
        </div>

        <div className="bg-surface-1 p-6 rounded-lg border border-border">
          <p className="text-sm text-text-secondary">Stock Total</p>
          <p className="text-3xl font-semibold mt-2">{metrics.totalStock}</p>
        </div>

        <div className="bg-surface-1 p-6 rounded-lg border border-border">
          <p className="text-sm text-text-secondary">Bajo Stock</p>
          <p className="text-3xl font-semibold mt-2 text-warning">
            {metrics.lowStockCount}
          </p>
        </div>

        <div className="bg-surface-1 p-6 rounded-lg border border-border">
          <p className="text-sm text-text-secondary">Valor Inventario</p>
          <p className="text-3xl font-semibold mt-2">
            ${metrics.inventoryValue.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mt-8 bg-surface-1 p-6 rounded-lg border border-border">
        <h2 className="text-lg font-semibold mb-4">Bienvenido a PANELA</h2>
        <p className="text-text-secondary mb-4">
          Sistema de gestión de inventario. Aquí podrás ver las métricas principales de tu inventario.
        </p>
        
        {isDemo && (
          <div className="mt-4 p-4 bg-info-light border border-info-border rounded-md">
            <h3 className="font-medium text-info-foreground mb-2">ℹ️ Modo Demostración</h3>
            <p className="text-sm text-text-secondary mb-2">
              Estás viendo datos de ejemplo. Para ver datos reales:
            </p>
            <ol className="text-sm text-text-secondary list-decimal list-inside space-y-1">
              <li>Configura Supabase ejecutando el script SQL</li>
              <li>Restaura la autenticación (ver DEV_MODE.md)</li>
              <li>Reinicia el servidor</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

