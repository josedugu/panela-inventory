/**
 * Página raíz de la aplicación
 *
 * El middleware se encarga de redirigir:
 * - Usuarios autenticados -> /dashboard
 * - Usuarios no autenticados -> /sign-in
 *
 * Esta página no necesita lógica adicional ya que el middleware
 * maneja todas las redirecciones antes de que se renderice.
 */
export default function Home() {
  // Esta página nunca se renderiza porque el middleware redirige antes
  // Se mantiene para evitar errores de Next.js
  return null;
}
