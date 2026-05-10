# Verificación manual (DevTools → Red) — área pública / sesión

Confirma que el **host** de las peticiones XHR/fetch coincide con `NEXT_PUBLIC_API_URL` (solo ca-api). Tras el login, el refresh del access token usa `POST /auth/refresh` con el refresh token (no debe ir a otro host).

| Flujo | Qué revisar |
|-------|-------------|
| `/login` | `POST /auth/login` al guardar; sin puerto **8000** en el navegador |
| `/register` | `POST /auth/register` |
| Sesión activa | Tras login: llamadas con `Authorization: Bearer` a `/users/me`, `/users/profile`, carrito, etc. |
| Refresh | Tras 401 en una petición autenticada: `POST /auth/refresh`, luego repetición de la petición original |
