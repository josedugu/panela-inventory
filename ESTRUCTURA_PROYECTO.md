# Estructura del Proyecto PANELA

## Esquema de Organización

```
src/
├── app/                          # Next.js App Router (páginas y rutas)
│   ├── (auth)/                   # Rutas de autenticación
│   ├── auth/                     # Callbacks de auth
│   └── dashboard/                # Rutas del dashboard
│
├── components/                    # Componentes compartidos/reutilizables
│   ├── auth/                     # Componentes de autenticación genéricos
│   ├── layout/                   # Componentes de layout (nav, sidebar, etc.)
│   ├── providers/                # Providers de React (Query, etc.)
│   └── ui/                       # Componentes UI base (shadcn/ui)
│
├── config/                       # Configuración del proyecto
│   ├── permissions.ts            # Definición de permisos
│   ├── canAccessRoute.ts         # Validación de acceso a rutas
│   └── canPerformAction.ts       # Validación de acciones
│
├── data/                         # Capa de datos
│   └── repositories/             # Repositorios (acceso a BD)
│
├── features/                     # Features del negocio (organización por dominio)
│   ├── {feature-name}/
│   │   ├── actions/              # Server Actions de la feature
│   │   ├── components/           # Componentes específicos de la feature
│   │   ├── schemas/              # Schemas de validación (Zod)
│   │   ├── hooks/                # Hooks personalizados (opcional)
│   │   ├── types/                # Tipos TypeScript (opcional)
│   │   └── index.tsx             # Exportaciones públicas
│
├── hooks/                        # Hooks globales compartidos
├── lib/                          # Utilidades y helpers
│   ├── auth/                     # Utilidades de autenticación
│   ├── prisma/                   # Cliente de Prisma
│   └── supabase/                 # Clientes de Supabase
├── services/                     # Servicios externos
└── types/                        # Tipos globales de TypeScript
```

## Lógica de Organización

### 1. Features (`src/features/`)
Cada feature representa un dominio del negocio y contiene todo lo relacionado:

- **`actions/`**: Server Actions dedicadas a esa feature
  - Cada action es un archivo `.ts` con funciones `async` marcadas con `"use server"`
  - Se exportan desde `actions/index.ts`
  
- **`components/`**: Componentes React específicos de la feature
  - Componentes que solo se usan dentro de esa feature
  
- **`schemas/`**: Schemas de validación (Zod)
  - Validaciones de formularios y datos de entrada
  
- **`hooks/`**: Hooks personalizados (opcional)
  - Solo si la feature necesita hooks específicos
  
- **`types/`**: Tipos TypeScript (opcional)
  - Solo si la feature necesita tipos específicos no compartidos
  
- **`index.tsx` o `index.ts`**: Punto de entrada público
  - Exporta componentes, actions y tipos que otras partes pueden usar

### 2. Componentes Compartidos (`src/components/`)
- **`ui/`**: Componentes base reutilizables (shadcn/ui)
- **`layout/`**: Componentes de layout global
- **`auth/`**: Componentes de autenticación genéricos
- **`providers/`**: Providers de React Context

### 3. Repositorios (`src/data/repositories/`)
- Acceso directo a la base de datos
- Funciones que encapsulan queries de Prisma
- No contienen lógica de negocio, solo acceso a datos

### 4. Config (`src/config/`)
- Configuraciones globales
- Permisos y validaciones de acceso
- Constantes del sistema

## Estructura Actual por Feature

### ✅ Features con Estructura Correcta

#### `customers/`
```
customers/
├── actions/
│   ├── create-customer.ts
│   ├── delete-customer.ts
│   ├── get-customers.ts
│   ├── get-customer-sales.ts
│   ├── update-customer.ts
│   └── index.ts
├── components/
│   ├── customers.tsx
│   ├── columns.tsx
│   └── view-customer-modal.tsx
├── schemas/
│   └── form.schemas.ts
└── index.tsx
```

#### `sales/`
```
sales/
├── actions/
│   ├── create-sale.ts
│   ├── get-sales.ts
│   ├── get-sale-details.ts
│   ├── get-sale-for-edit.ts
│   ├── get-sale-form-data.ts
│   ├── get-payment-methods.ts
│   ├── search-customers.ts
│   ├── search-products.ts
│   └── index.ts (implícito)
├── components/
│   └── [8 componentes]
└── index.ts
```

#### `dashboard/`
```
dashboard/
├── actions/
│   ├── get-dashboard-metrics.ts
│   ├── get-low-stock-products.ts
│   ├── get-recent-activity.ts
│   └── index.ts
├── components/
│   └── [2 componentes]
└── index.tsx
```

#### `auth/`
```
auth/
├── actions/
│   └── get-user-role.ts
├── components/
│   └── [11 componentes]
└── index.tsx
```

### ⚠️ Features con Estructura Anidada (Válida pero Diferente)

#### `inventory/`
```
inventory/
├── actions/                      # Actions generales de inventory
│   ├── create-inventory-movement.ts
│   └── index.ts
├── management/                   # Sub-feature: gestión de productos
│   ├── actions/                  # Actions específicas de management
│   │   ├── create-product.ts
│   │   ├── delete-product.ts
│   │   ├── get-products.ts
│   │   ├── update-product.ts
│   │   ├── get-filter-options.ts
│   │   ├── get-product-locations.ts
│   │   └── index.ts
│   ├── columns.tsx
│   └── inventory.tsx
├── movements/                    # Sub-feature: movimientos
│   ├── actions/                  # Actions específicas de movements
│   │   ├── get-inventory-movements.ts
│   │   ├── get-movement-form-data.ts
│   │   └── index.ts
│   ├── columns.tsx
│   └── inventory-movements.tsx
├── general-ui/                   # Componentes UI compartidos
├── functions/                    # Funciones utilitarias
├── conts/                        # Constantes
├── schemas/
└── index.tsx
```

**Nota**: Esta estructura es válida porque `inventory` es una feature compleja con sub-dominios claros.

### ❌ Inconsistencias Encontradas

#### 1. `master-data/productos/actions.ts` (CRÍTICO)
**Problema**: Las actions están directamente en `productos/` en lugar de `productos/actions/`

**Estructura actual**:
```
master-data/
├── productos/
│   ├── actions.ts          ❌ Debería estar en actions/
│   ├── columns.tsx
│   ├── index.tsx
│   └── schemas.ts
```

**Estructura esperada**:
```
master-data/
├── productos/
│   ├── actions/            ✅
│   │   ├── [archivos de actions]
│   │   └── index.ts
│   ├── columns.tsx
│   ├── index.tsx
│   └── schemas.ts
```

#### 2. `master-data/actions/` (INCONSISTENCIA)
**Problema**: Hay actions centralizadas en `master-data/actions/` pero también hay actions en subcarpetas

**Estructura actual**:
```
master-data/
├── actions/
│   ├── index.ts                    # Centraliza todas las actions
│   └── tipo-producto.actions.ts
├── productos/
│   └── actions.ts                   # Actions específicas de productos
└── [otras subcarpetas sin actions]
```

**Análisis**: 
- Las subcarpetas de master-data (marcas, modelos, etc.) NO tienen su propia carpeta `actions/`
- Sus actions están centralizadas en `master-data/actions/index.ts`
- Pero `productos/` tiene `actions.ts` directamente en su carpeta
- Esto crea inconsistencia: ¿dónde van las actions de master-data?

**Recomendación**: 
- Opción A: Todas las actions de master-data en `master-data/actions/` (centralizado)
- Opción B: Cada subcarpeta tiene su `actions/` (descentralizado)

#### 3. `master-data/schemas/` (VACÍA)
**Problema**: Existe la carpeta pero está vacía. Los schemas están en cada subcarpeta como `schemas.ts`

**Estructura actual**:
```
master-data/
├── schemas/                 # Carpeta vacía ❌
├── marcas/
│   └── schemas.ts          # Schema aquí
└── productos/
    └── schemas.ts          # Schema aquí
```

**Recomendación**: Eliminar `master-data/schemas/` si no se usa, o mover los schemas allí si se quiere centralizar.

## Reglas de Estructura

### ✅ Reglas que se Deben Seguir

1. **Actions dentro de la feature**: Todas las server actions de una feature deben estar en `{feature}/actions/`
2. **Componentes dentro de la feature**: Componentes específicos en `{feature}/components/`
3. **Schemas dentro de la feature**: Schemas en `{feature}/schemas/` o en la subcarpeta correspondiente
4. **Exportaciones públicas**: Usar `index.tsx` o `index.ts` para exportar lo que otras partes pueden usar
5. **Repositorios centralizados**: Todos los repositorios en `src/data/repositories/`
6. **Componentes UI compartidos**: En `src/components/ui/`

### ⚠️ Excepciones Válidas y Patrones Especiales

#### 1. Features Complejas con Sub-Dominios: `inventory/`

**Patrón**: Cuando una feature es lo suficientemente compleja como para tener sub-dominios claros, se permite una estructura anidada.

**Ejemplo**: `inventory/` tiene dos sub-dominios:
- `management/`: Gestión de productos en inventario
- `movements/`: Movimientos de inventario (entradas/salidas)

**Estructura permitida**:
```
inventory/
├── actions/              # Actions generales de inventory
├── management/           # Sub-dominio: gestión
│   ├── actions/          # Actions específicas de management
│   └── [componentes]
├── movements/            # Sub-dominio: movimientos
│   ├── actions/          # Actions específicas de movements
│   └── [componentes]
└── [recursos compartidos]
```

**Cuándo usar este patrón**:
- La feature tiene múltiples sub-dominios claramente diferenciados
- Cada sub-dominio tiene su propia lógica de negocio
- Los sub-dominios comparten algunos recursos pero son independientes

**Cuándo NO usar este patrón**:
- Si solo hay una funcionalidad simple, usar estructura estándar
- Si los sub-dominios son muy pequeños, considerar separarlos en features independientes

#### 2. Features con Estructura Especial: `master-data/`

**Patrón**: Feature que agrupa múltiples entidades relacionadas bajo un mismo dominio conceptual.

**Ejemplo**: `master-data/` agrupa todas las entidades de datos maestros (marcas, modelos, productos, etc.)

**Estructura permitida**:
```
master-data/
├── actions/
│   └── index.ts          # Reexporta actions de subcarpetas
├── productos/
│   ├── actions/          # Actions específicas de productos
│   └── [componentes]
├── marcas/
│   └── [componentes]    # Sin actions propias, usa actions centralizadas
└── [otras entidades]
```

**Características**:
- Las actions pueden estar en subcarpetas (`productos/actions/`) o centralizadas (`master-data/actions/`)
- Todas las actions se reexportan desde `master-data/actions/index.ts` para importación centralizada
- Permite flexibilidad: entidades complejas pueden tener sus propias actions, entidades simples usan actions centralizadas

**Razón del patrón**:
- Facilita la organización de múltiples entidades relacionadas
- Permite importación centralizada: `from "@/features/master-data/actions"`
- Mantiene la flexibilidad para casos especiales (como productos que tiene lógica compleja)

## Resumen de Inconsistencias

| Ubicación | Problema | Severidad | Estado |
|-----------|----------|-----------|--------|
| `master-data/productos/actions.ts` | Actions fuera de carpeta `actions/` | 🔴 Alta | ✅ **CORREGIDO**: Movido a `productos/actions/index.ts` |
| `master-data/actions/` vs `productos/actions.ts` | Inconsistencia en dónde guardar actions | 🟡 Media | ✅ **RESUELTO**: Patrón híbrido mantenido (actions en subcarpetas, reexportadas centralmente) |
| `master-data/schemas/` | Carpeta vacía | 🟢 Baja | ✅ **ELIMINADO**: Carpeta removida |

## Cambios Realizados

### ✅ 1. Reorganización de Actions de Productos
- **Antes**: `master-data/productos/actions.ts`
- **Después**: `master-data/productos/actions/index.ts`
- **Impacto**: Ninguno, las importaciones se mantienen a través de `master-data/actions/index.ts`

### ✅ 2. Eliminación de Carpeta Vacía
- **Eliminado**: `master-data/schemas/` (carpeta vacía)
- **Razón**: Los schemas están en cada subcarpeta como `schemas.ts`, no se necesita carpeta central

### 📋 Patrón Final de Master-Data
El patrón actual es **híbrido y funcional**:
- Las actions de cada subcarpeta (como `productos/actions/`) se reexportan centralmente en `master-data/actions/index.ts`
- Esto permite:
  - Organización clara por entidad
  - Importación centralizada desde `@/features/master-data/actions`
  - Flexibilidad para features complejas

## Recomendaciones Futuras

1. ✅ **Mantener el patrón actual**: El patrón híbrido funciona bien para master-data
2. ✅ **Documentar excepciones**: ✅ **COMPLETADO** - Las excepciones están documentadas arriba
3. **Consistencia en nuevas features**: Seguir el patrón estándar `{feature}/actions/` para nuevas features

## Guía Rápida para Nuevas Features

### Estructura Estándar (Recomendada)
```
{feature}/
├── actions/
│   ├── [action-name].ts
│   └── index.ts
├── components/
│   └── [component-name].tsx
├── schemas/
│   └── [schema-name].ts
└── index.tsx
```

### ¿Cuándo usar estructura anidada?
- ✅ **SÍ**: Si la feature tiene sub-dominios claros e independientes (ej: `inventory/management/` y `inventory/movements/`)
- ❌ **NO**: Si solo es una funcionalidad simple o variaciones de lo mismo

### ¿Dónde poner las actions?
- **Feature simple**: `{feature}/actions/`
- **Feature con sub-dominios**: `{feature}/{subdomain}/actions/`
- **Feature tipo master-data**: Puede usar patrón híbrido (subcarpetas + reexportación central)

