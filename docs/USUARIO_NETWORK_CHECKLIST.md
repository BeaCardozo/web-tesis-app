# Verificación manual (DevTools → Red) — rutas `/usuario`

Para cada ruta, confirma que el **host** de las peticiones XHR/fetch coincide con `NEXT_PUBLIC_API_URL` (solo ca-api).

| Ruta | Qué revisar |
|------|-------------|
| `/usuario/inicio` | `/products/featured`, `/categories`, `/products` |
| `/usuario/productos` | `/products?…`, `/categories` |
| `/usuario/producto/:id` | `GET /products/:id`, llamadas a `/carts` al agregar al carrito |
| `/usuario/categorias` | `/categories` |
| `/usuario/ofertas` | `/offers/deals` |
| `/usuario/carrito` | `/carts`, `/carts/:id`, `/carts/:id/compare` |
| `/usuario/perfil` | `PATCH /users/profile` al guardar |

No debe aparecer el puerto **8000** ni el host del contenedor del scraper en peticiones iniciadas desde el navegador.
