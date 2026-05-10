# Verificación manual (DevTools → Red) — `/admin/*`

Confirma que todas las peticiones van a `NEXT_PUBLIC_API_URL` (ca-api con prefijo `/api`). Rol **admin** en JWT.

| Ruta | Qué revisar |
|------|-------------|
| `/admin/dashboard` | `GET /admin/stats` |
| `/admin/usuarios` | `GET /users`; creación/edición `POST|PUT /users`, `PATCH /users/:id/status`, `DELETE /users/:id` |
| `/admin/supermercados` | `GET /supermarkets/admin`; `POST /supermarkets`; `PUT`, `PATCH .../status`, `DELETE` sobre `/supermarkets/:id` |
| `/admin/auditoria` | **Sin API hoy** — datos locales/mock; ver nota en `MOCK_ONLY_PAGES.md` |

No debe aparecer el puerto **8000** ni el scraper en peticiones del navegador.
