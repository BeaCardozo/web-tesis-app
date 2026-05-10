# Páginas sin datos reales de ca-api (mock o UI sola)

Estas pantallas **no** consumen `app/lib/api.ts` para datos de negocio; usan `mockData` u otra fuente local. El sitio muestra un aviso «datos de demostración» para no confundirlas con producción.

| Ruta | Motivo breve |
|------|----------------|
| `/admin/auditoria` | Logs de auditoría aún no expuestos por la API. |
| `/analista/cargas` | No hay ruta Nest/Next de subida; la UI es prototipo. |
| `/analista/historial` | Historial de precios simulado en `mockData`. |
| `/analista/reportes` | Reportes simulados en `mockData`. |

Cuando existan endpoints reales, sustituir mocks y quitar el aviso en esas vistas.
