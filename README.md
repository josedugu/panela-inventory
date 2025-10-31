# 🥘 PANELA - Sistema de Gestión de Inventario

Sistema moderno de gestión de inventario construido con Next.js 15, Supabase y Tailwind CSS v4.

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Supabase](https://img.shields.io/badge/Supabase-enabled-green)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-blue)

---

## 🎯 Descripción

PANELA es una aplicación web completa para la gestión de inventario de productos tecnológicos. Incluye autenticación, gestión de productos, control de stock, y dashboards con métricas en tiempo real.

### ✨ Características

- ✅ **Autenticación** con Supabase Auth
- ✅ **CRUD completo** de productos e inventario
- ✅ **Dashboard** con métricas y gráficos
- ✅ **Tema claro/oscuro** con persistencia
- ✅ **Responsive** - móvil, tablet y desktop
- ✅ **Server Components** y Server Actions
- ✅ **Row Level Security** (RLS) en Supabase
- ✅ **TypeScript** con tipado completo
- ✅ **Validación** con Zod

---

## 🚀 Quick Start

### Pre-requisitos

- Node.js 18+ o Bun
- Cuenta en Supabase (gratis)

### Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Supabase

# 3. Configurar base de datos en Supabase
# Ejecutar SUPABASE_SETUP.sql en el SQL Editor

# 4. Iniciar servidor de desarrollo
npm run dev
```

📖 **Guía completa:** Ver [QUICK_START.md](./QUICK_START.md)

---

## 📁 Estructura del Proyecto

```
src/
├── app/                    # App Router (Next.js)
│   ├── (auth)/            # Rutas de autenticación
│   ├── (dashboard)/       # Rutas protegidas
│   └── globals.css        # Estilos globales con tema
│
├── components/            # Componentes React
│   ├── ui/               # Componentes base (Shadcn)
│   ├── layout/           # Layouts y navegación
│   ├── inventory/        # Componentes de inventario
│   └── auth/             # Componentes de auth
│
├── lib/                  # Librerías y utilidades
│   └── supabase/        # Clientes de Supabase
│
├── data/                 # Data Access Layer
│   ├── repositories/    # Repositorios (CRUD)
│   └── queries/         # Queries complejos
│
├── actions/              # Server Actions
│   └── products/        # Actions de productos
│
├── types/               # TypeScript types
│   ├── database.types.ts # Tipos de Supabase
│   └── schemas/         # Schemas de Zod
│
├── hooks/               # Custom React Hooks
├── services/            # Business logic
└── config/              # Configuraciones
```

---

## 🏗️ Stack Tecnológico

### Frontend

- **Next.js 15** - Framework React con App Router
- **React 19** - Librería de UI
- **TypeScript** - Tipado estático
- **Tailwind CSS v4** - Estilos utility-first

### Backend & Database

- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - Row Level Security
  - Real-time subscriptions
  - Storage

### UI Components

- **Shadcn UI** - Componentes base (Radix UI)
- **Lucide React** - Iconos
- **Recharts** - Gráficos
- **Sonner** - Notificaciones toast

### Development

- **Biome** - Linter y formatter
- **React Query** - State management
- **React Hook Form** - Formularios
- **Zod** - Validación de schemas

---

## 🔧 Comandos Disponibles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run build            # Build de producción
npm run start            # Servidor de producción
npm run lint             # Linter (Biome)
npm run format           # Formatear código

# Supabase (requiere Supabase CLI)
supabase login
supabase link --project-ref <ref>
supabase gen types typescript --linked > src/types/database.types.ts
```

---

## 📊 Estado del Proyecto

Ver [SETUP_STATUS.md](./SETUP_STATUS.md) para el estado detallado.

**Resumen:**

- ✅ Estructura completa
- ✅ Configuración de Supabase
- ✅ Data layer (repositories y actions)
- ✅ Componentes base copiados
- ⏸️ Páginas pendientes
- ⏸️ Componentes necesitan adaptación

**Progreso:** ~40%

---

## 🗄️ Base de Datos

### Tablas Principales

- **products** - Productos del inventario
- **categories** - Categorías de productos
- **inventory** - Niveles de stock
- **profiles** - Perfiles de usuario

### Funciones SQL

- `get_low_stock_products()` - Obtener productos con bajo stock
- `calculate_inventory_value()` - Calcular valor total del inventario

📖 **Schema completo:** Ver [SUPABASE_SETUP.sql](./SUPABASE_SETUP.sql)

---

## 🔐 Autenticación

### Flujo de Auth

1. Usuario se registra/login con Supabase Auth
2. Middleware valida sesión en cada request
3. RLS protege acceso a datos en BD
4. Server Components verifican usuario

### Configuración

- Email/Password habilitado por defecto
- OAuth providers configurables (Google, GitHub)
- Magic links disponibles

---

## 📱 Responsive Design

- **Mobile First** - Diseñado para móvil primero
- **Breakpoints:**
  - Mobile: < 768px
  - Tablet: 768px - 1023px
  - Desktop: ≥ 1024px

---

## 🎨 Design System

### Colores

- Modo claro y oscuro
- Colores semánticos (success, warning, error, info)
- Jerarquía de texto en 4 niveles

### Tipografía

- Base: 16px
- Escala: xs, sm, base, lg, xl, 2xl
- Pesos: normal (400), medium (500), semibold (600)

### Espaciado

- Sistema de grid de 8px
- Tokens: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px

📖 **Guía completa:** Ver documentación en `/src/DESIGN_SYSTEM.md` del proyecto original

---

## 🧪 Testing

```bash
# Pendiente de configurar
npm run test
npm run test:e2e
```

---

## 🚢 Deploy

### Vercel (Recomendado)

```bash
# 1. Conectar con GitHub
git push

# 2. Importar en Vercel
# https://vercel.com/new

# 3. Configurar variables de entorno
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY

# 4. Deploy automático
```

### Otros proveedores

- Netlify
- Railway
- Fly.io
- Self-hosted con Docker

---

## 📖 Documentación

- [Quick Start](./QUICK_START.md) - Guía de inicio rápido
- [Setup Status](./SETUP_STATUS.md) - Estado de configuración
- [Supabase Setup](./SUPABASE_SETUP.sql) - Script de base de datos
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 🤝 Contribuir

Este es un proyecto privado en desarrollo. Si encuentras bugs o tienes sugerencias:

1. Documenta el issue
2. Propón una solución
3. Implementa con buenas prácticas
4. Mantén el código limpio

---

## 📄 Licencia

Proyecto privado - Todos los derechos reservados

---

## 👥 Equipo

- **Desarrollo:** Tu equipo
- **Diseño:** Basado en Figma Design System
- **Backend:** Supabase

---

## 🙏 Agradecimientos

- Next.js team
- Supabase team
- Shadcn UI
- Vercel

---

**¿Listo para empezar?** 👉 Lee [QUICK_START.md](./QUICK_START.md)
