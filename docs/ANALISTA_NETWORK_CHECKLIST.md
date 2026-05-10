# Verificación manual (DevTools → Red) — `/analista/*`

Confirma `NEXT_PUBLIC_API_URL` en todas las llamadas. Rol **partner** (analista) en JWT.

| Ruta | Qué revisar |
|------|-------------|
| `/analista/dashboard` | `GET /partners/me/dashboard` |
| `/analista/productos` | `GET /partners/me/products?search=&page=&limit=` |
| `/analista/cargas` | **Sin API de upload** — historial/estado mock; ver `MOCK_ONLY_PAGES.md` |
| `/analista/historial` | **Solo mock** — sin llamadas ca-api |
| `/analista/reportes` | **Solo mock** — sin llamadas ca-api |

El DWH (puerto 8000) solo lo usa el **backend** Nest; el navegador no debe apuntar a ese host.
