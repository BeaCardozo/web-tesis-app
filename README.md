# CaracasAhorra — Web (Next.js)

Comparador de precios de la canasta alimentaria en supermercados de Caracas.
Trabajo de grado · Universidad Metropolitana · David Dávila y Beatriz Cardozo.

Este repositorio contiene la **web** (Next.js 16 / React 19 / Tailwind v4).
La API Nest (`ca-api`) y el pipeline de scraping/DWH (`ca-scraper`) viven en
repositorios separados.

## Requisitos

- Node 20+ (probado con 20.x y 22.x)
- npm 10+
- `ca-api` corriendo localmente o accesible vía URL (ver más abajo)

## Setup

```bash
git clone <repo>
cd web-tesis-app
npm install
cp .env.example .env.local
# Edita .env.local si tu ca-api no está en localhost:4003
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

## Variables de entorno

| Variable | Obligatoria | Descripción |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Sí | Base del API Nest (`ca-api`). Incluye `/api`. Ej.: `http://localhost:4003/api`. |

> **Importante:** la web sólo debe hablar con `ca-api`. La URL del DWH/scraper
> no debe estar expuesta como `NEXT_PUBLIC_*`. La comprobación
> `npm run check:public-api` falla si aparece un patrón prohibido bajo `app/`.

## Scripts

| Script | Hace |
|---|---|
| `npm run dev` | Servidor de desarrollo en `localhost:3000`. |
| `npm run build` | Build de producción. |
| `npm start` | Sirve el build de producción. |
| `npm run lint` | ESLint sobre todo el árbol. |
| `npm run check:public-api` | Verifica que el front no exponga la URL del scraper/DWH. |

## Arquitectura

```
app/
├─ admin/        Páginas del rol Administrador (dashboard, usuarios, supermercados, auditoría, historial)
├─ analista/     Páginas del rol Analista (dashboard, productos, cargas CSV, historial, reportes)
├─ usuario/      Páginas del rol Usuario final (inicio, productos, categorías, ofertas, carrito, perfil)
├─ components/   Componentes compartidos (Sidebar*, Pagination, ProductOfferPrice, FxRateDisplay, etc.)
├─ context/      React contexts (AuthContext, FxContext, SidebarContext)
├─ hooks/        Hooks reutilizables (usePagination)
├─ lib/          Cliente API, mappers, utilidades de fecha/moneda/íconos
├─ types/        Tipos compartidos (UserRole, AuditLog, etc.)
├─ login/        Páginas públicas
├─ register/
└─ page.tsx      Landing
```

La autenticación usa **access + refresh JWT** guardados en `localStorage`, con
refresh proactivo basado en `exp`. La detección de cambio de sesión en otra
pestaña vive en `components/SessionChangeBanner`. La tasa USD→Bs se obtiene
de `ca-api` `/meta/fx/current` y se cachea localmente (`context/FxContext`).

## Documentación operacional

En `docs/` hay checklists de tráfico de red por rol — útiles cuando se
verifica integración con `ca-api`:

- `docs/PUBLIC_NETWORK_CHECKLIST.md`
- `docs/USUARIO_NETWORK_CHECKLIST.md`
- `docs/ANALISTA_NETWORK_CHECKLIST.md`
- `docs/ADMIN_NETWORK_CHECKLIST.md`

## Despliegue

El despliegue recomendado es Vercel; al ser una app Next.js estándar,
cualquier host que soporte Node 20+ funciona. Sólo hay que definir
`NEXT_PUBLIC_API_URL` apuntando al `ca-api` correspondiente.
