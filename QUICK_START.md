# 🚀 Quick Start - PANELA

Guía rápida para poner en marcha el proyecto.

## 📋 Pre-requisitos

- Node.js 18+ o Bun
- Cuenta en Supabase (gratis)
- Editor de código (VS Code recomendado)

---

## ⚡ Setup Rápido (5 minutos)

### 1. Instalar dependencias

```bash
cd /Users/josegutierrez/Desktop/Trocha/PANELA/panela

# Con npm
npm install

# O con bun (si lo tienes)
bun install
```

### 2. Configurar Supabase

#### A. Crear proyecto

1. Ve a https://supabase.com
2. Click en "New Project"
3. Completa:
   - Name: `panela-inventory`
   - Database Password: (genera y guarda)
   - Region: (la más cercana)
4. Espera 2 minutos a que se cree

#### B. Obtener credenciales

1. En tu proyecto, ve a: **Settings → API**
2. Copia:
   - `Project URL`
   - `anon public` key

#### C. Crear archivo `.env.local`

```bash
# Crear archivo en la raíz del proyecto panela
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=tu-project-url-aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
EOF
```

**O manualmente:**

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### D. Crear base de datos

1. En Supabase, ve a: **SQL Editor**
2. Click en "New Query"
3. Copia y pega TODO el contenido de `SUPABASE_SETUP.sql`
4. Click en "Run" (▶️)
5. Verifica que aparezca "Setup completado exitosamente!"

### 3. Verificar que funciona

```bash
npm run dev
```

Abre http://localhost:3000

**Esperado en este punto:**

- ⚠️ Página en blanco o error (normal, faltan las páginas)
- ✅ No hay errores de compilación
- ✅ Tailwind funciona (si ves estilos)

---

## 📝 Siguientes Pasos

### Paso 1: Actualizar Layout Principal

Editar `src/app/layout.tsx`:

```typescript
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PANELA - Inventory Management",
  description: "Sistema de gestión de inventario tecnológico",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Paso 2: Crear Página Principal

Editar `src/app/page.tsx`:

```typescript
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/sign-in");
}
```

### Paso 3: Crear Página de Sign In

Crear `src/app/(auth)/sign-in/page.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success("¡Inicio de sesión exitoso!");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-surface-1 rounded-lg shadow-lg border border-border">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">PANELA</h1>
          <p className="text-text-secondary mt-2">
            Sistema de Gestión de Inventario
          </p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Cargando..." : "Iniciar Sesión"}
          </Button>
        </form>

        <p className="text-center text-sm text-text-secondary">
          Usa Supabase Auth para crear una cuenta
        </p>
      </div>
    </div>
  );
}
```

### Paso 4: Probar Autenticación

1. Reiniciar servidor: `Ctrl+C` y `npm run dev`
2. Ir a http://localhost:3000
3. Deberías ver la página de login

**Para crear un usuario de prueba:**

1. Ve a Supabase → Authentication → Users
2. Click en "Add user" → "Create new user"
3. Ingresa email y password
4. Usa esas credenciales para login

### Paso 5: Crear Dashboard Básico

Crear `src/app/(dashboard)/dashboard/page.tsx`:

```typescript
import { getDashboardMetrics } from "@/data/queries/dashboard.queries";

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

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
    </div>
  );
}
```

Crear `src/app/(dashboard)/layout.tsx`:

```typescript
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface-1">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold">PANELA</h1>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
```

---

## ✅ Verificar que Todo Funciona

1. **Build sin errores:**

   ```bash
   npm run build
   ```

2. **Login funciona:**

   - Ve a http://localhost:3000
   - Login con tu usuario de Supabase
   - Deberías ver el dashboard con métricas reales

3. **Datos se muestran:**
   - Verifica que las 4 cards muestren números
   - Los números deben coincidir con los datos seed

---

## 🐛 Solución de Problemas

### Error: "Module not found"

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error: "Supabase URL is required"

- Verifica que `.env.local` existe
- Verifica que las variables están correctas
- Reinicia el servidor de dev

### Error: "Failed to fetch"

- Verifica que Supabase está configurado
- Verifica que ejecutaste el SQL setup
- Verifica las credenciales en `.env.local`

### Error: "RLS policy violation"

- Verifica que estás autenticado
- Verifica que las políticas RLS se crearon correctamente
- Ve a Supabase → Authentication y verifica tu usuario

---

## 📚 Recursos

- **Documentación del proyecto:** Ver `SETUP_STATUS.md`
- **SQL de setup:** Ver `SUPABASE_SETUP.sql`
- **Next.js Docs:** https://nextjs.org/docs
- **Supabase Docs:** https://supabase.com/docs
- **Tailwind CSS:** https://tailwindcss.com/docs

---

## 🎯 Siguiente Nivel

Una vez que tengas lo básico funcionando, continúa con:

1. Implementar más páginas del dashboard
2. Agregar más componentes del diseño original
3. Implementar CRUD completo de productos
4. Agregar manejo de imágenes
5. Implementar búsqueda y filtros
6. Agregar gráficos y reportes

**¡Buena suerte! 🚀**
