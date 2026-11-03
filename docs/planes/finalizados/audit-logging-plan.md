# Plan: Auditoría y logging de eventos

Estado: **Implementado**.

## Contexto

Hoy el logging es `console.log/error` disperso (≈25 usos en `src/app/api/**`, `src/hooks/actions/players.ts` y componentes cliente). Problemas:

- Sin estructura, nivel, ni contexto (ruta, usuario, requestId); varios `console.log(e)` para errores.
- No hay registro de quién hizo qué: el CRUD admin (`api/admin/[resource]`), alta de partidos, generación de sorteos, cambio de estado de torneos, fotos y unificación usuarios/jugadores no dejan rastro.
- Login (`src/lib/auth.ts`, `authorize`) devuelve `null` sin registrar intentos fallidos.
- Errores de UI/servidor no se centralizan; no hay `error.tsx`/`global-error.tsx` ni `instrumentation.ts`.

Se separan dos conceptos:

1. **Logging operativo** (salud/diagnóstico): stdout estructurado JSON, efímero (Vercel logs / docker).
2. **Auditoría** (quién cambió qué): persistente en DB, consultable por admin.

## Fase 1 — Logger estructurado (`src/lib/logger.ts`)

- Decisión: usar **pino** (salida a stdout, sin transports/workers; agregarlo a `serverExternalPackages` en `next.config.ts`) y no winston (pensada para transports a archivo, que no sirven en Vercel). Por ahora todo queda dentro de Vercel (Runtime Logs + auditoría en DB); sin Sentry/Axiom hasta tener uso productivo.
- Enmascarado en 3 capas: `redact` de pino con rutas explícitas (`password`, `*.password`, `token`, `authorization`, `cookie`, `secret`, `hash`), sanitizador propio por regex de claves (`/pass|token|secret|auth|cookie|hash|key/i`, emails parciales, truncado) y regla de no loguear bodies ni objetos de usuario completos. Ninguna librería detecta datos sensibles por contenido.
- Wrapper sobre pino con niveles `debug|info|warn|error`, salida JSON una línea (`ts, level, event, msg, requestId, userId, route, durationMs, err{name,message,stack,code}`). Nivel por `LOG_LEVEL` (default `info` en prod, `debug` en dev).
- Redacción obligatoria de claves sensibles (`password`, `token`, `authorization`, `cookie`, `secret`, emails parcialmente enmascarados) y truncado de payloads grandes.
- Serializador de errores (incluye `code` de Prisma, `cause`).
- Helper `withApiLogging(handler, { event })` para route handlers: genera `requestId` (header `x-request-id` o `crypto.randomUUID()`), mide duración, loguea `api.request` (info, status, método, ruta; sin body) y `api.error` (error) ante excepciones no controladas, y devuelve 500 genérico con `requestId` para correlacionar.
- Tests unitarios (`src/lib/logger.test.ts`, agregado al script `npm test`): redacción, niveles, serialización de errores.

## Fase 2 — Modelo de auditoría (Prisma)

Migración `AuditLog` (tabla append-only):

| Campo | Notas |
|---|---|
| `id` (cuid), `createdAt` (índice) | |
| `actorId?`, `actorRole?`, `actorEmail?` | `null` = sistema/anónimo (seed, login fallido) |
| `action` (índice) | `CREATE/UPDATE/DELETE/RESTORE/LOGIN_SUCCESS/LOGIN_FAILURE/...` |
| `entity` (índice), `entityId?` | `Tournament`, `Match`, `Player`, `User`, `Venue`… |
| `before?`, `after?` (`Json`) | diff de campos relevantes, sin `password` ni hashes |
| `metadata?` (`Json`) | `requestId`, ip, user-agent, resultado |

- `src/lib/audit.ts`: `audit({ action, entity, entityId, before, after, metadata })` que toma actor de `getServerSession`, `requestId` del contexto, y **nunca rompe la operación principal** (try/catch + `logger.error('audit.write_failed')`). Para mutaciones críticas aceptar `tx` para escribir en la misma transacción.
- Helper `diffObjects(before, after)` con lista blanca/lista negra de campos.
- Sin UPDATE/DELETE sobre `AuditLog` desde la app; retención configurable (job/script que purga > N meses).

## Fase 3 — Eventos a instrumentar

Auditoría (DB) + log `info`:

- **Auth**: login OK/fallido (`authorize` en `src/lib/auth.ts`; motivo: usuario inexistente / inactivo / password; no registrar el password), logout, cambios de rol/`isActive`.
- **Admin CRUD** (`api/admin/[resource]` y `[id]`): create/update/soft-delete/restore con before/after.
- **Torneos**: cambios de estado (`PREPARATION`→…), generación/confirmación de sorteo (`api/tournaments/[id]/draw`), definición de campeón.
- **Partidos**: `api/add-match`, edición, borrado; recálculo de puntos/niveles (`player-level.ts`) con resumen de cambios.
- **Jugadores/usuarios**: fotos subida/borrada (`players/[id]/photo`, incluyendo fallos al borrar blobs), `unify-users-players` (cantidad afectada y ids).
- **Accesos denegados**: 401/403 de `requireSession/requireAdmin` (`src/lib/require-session.ts`) como `warn` (con ruta y usuario) — útil para detectar abuso.

Logging operativo (solo stdout):

- `api.request` por endpoint (status, duración); `warn` si > umbral (p. ej. 1 s) para consultas lentas (leaderboard, stats, home).
- Errores de Prisma (`P2002`, `P2025`, timeouts de conexión) con `code` y modelo.
- Integraciones externas: Vercel Blob (latencia, errores), sharp/procesado de imagen.
- Validaciones fallidas 4xx a nivel `debug`/`warn` (sin payload completo).
- Arranque: `instrumentation.ts` (`register`) loguea versión/entorno y valida variables requeridas (`DATABASE_URL`, `NEXTAUTH_SECRET`, `BLOB_READ_WRITE_TOKEN`); `onRequestError` para capturar errores de render/RSC no manejados.

## Fase 4 — Reemplazo de `console.*` y cobertura de errores

- Reemplazar todos los `console.log/error` de `src/app/api/**` por `logger` (los `console.log(e)` pasan a `logger.error('<ruta>.failed', { err })`).
- Eliminar `console.log("Setting players data", data)` en `src/hooks/actions/players.ts` y el comentario muerto en `Venues.template.tsx`.
- Agregar `src/app/error.tsx` y `global-error.tsx` con mensaje amigable + `digest`/`requestId`; opcional `POST /api/client-log` (rate-limited, tamaño máximo, solo errores) para errores de cliente, reemplazando los `console.error` de componentes.
- Regla ESLint `no-console` (permitido solo en `src/lib/logger.ts`) para evitar regresiones.
- Endpoint de salud `GET /api/health` (DB `SELECT 1`, versión, uptime) para monitoreo.

## Fase 5 — Consulta de auditoría

- `GET /api/admin/audit-logs` (solo `requireAdmin`), paginado, filtros por actor, entidad, acción, rango de fechas.
- Pestaña «Auditoría» en `DashboardConsole` (tabla con filtros y detalle JSON before/after), siguiendo el patrón de los modales existentes.
- Desde un error de usuario (`requestId`) poder buscar el evento correlacionado.

## Privacidad y seguridad

- No persistir passwords/hashes/tokens; enmascarar emails en logs operativos (en auditoría se guarda `actorId`).
- IP/user-agent solo en auditoría de auth, con retención acotada; reflejarlo en `src/app/privacy/page.tsx`.
- `audit-logs` jamás accesible a rol `USER`.

## Verificación

- Unit tests de logger/redacción y `diffObjects`.
- Integración (`npm run test:integration`): cada mutación admin crea exactamente un registro con actor, before/after correctos; login fallido genera `LOGIN_FAILURE`; fallo simulado de auditoría no rompe la operación; `/api/admin/audit-logs` devuelve 403 a no-admin.
- E2E: acción en dashboard visible en la pestaña Auditoría.
- `npm run typecheck`, `npm run lint`, `npm test`.

## Orden de entrega sugerido (PRs)

1. Logger + tests + `instrumentation.ts` + `/api/health`.
2. Reemplazo de `console.*`, `error.tsx`, `no-console`.
3. Migración `AuditLog` + `audit.ts` + instrumentar auth y admin CRUD.
4. Instrumentar torneos/partidos/fotos/unify.
5. API y UI de consulta, retención y actualización de privacidad.

## Decisiones abiertas

- Despliegue en Vercel: los Runtime Logs tienen retención corta (según plan, de ~1 hora a pocos días; verificar en la documentación vigente). Propuesta: empezar con stdout + auditoría en DB, y sumar Sentry (errores, plan gratuito) y/o Axiom (logs, integración nativa con Vercel) cuando haga falta retención o alertas. El logger debe permitir agregar destinos sin cambiar los call sites.
- Retención de auditoría (propuesta: 12 meses; auth: 90 días).
- ¿Auditar también lecturas sensibles (listado de usuarios)? Propuesta: no.

## Resultado de la implementación

- Logger: `src/lib/logger.ts` (pino) + `src/lib/log-sanitize.ts`, `src/lib/api-logging.ts` (`withApiLogging`), `src/lib/request-context.ts`, `src/instrumentation.ts`, `GET /api/health`.
- Auditoría: modelo `AuditLog` (migración `20261101010000_add_audit_log`), `src/lib/audit.ts`, `src/lib/audit-diff.ts`, `src/lib/admin-audit.ts`; instrumentados login, accesos denegados (403), CRUD admin, acciones de torneo, alta de partidos, fotos y unificación usuarios/jugadores.
- Consulta: `GET /api/admin/audit-logs` y pestaña «Auditoría» en el dashboard.
- `no-console` en `src/app/api`, `src/lib`, `src/utils`; `error.tsx` y `global-error.tsx`.
- Tests: `src/lib/*.test.ts` (unit) y bloque «health, audit trail and logging» en `tests/integration/api.test.ts`.

### Diferencias respecto al plan

- La generación de sorteo (`GET /api/tournaments/[id]/draw`) es una vista previa que no persiste: se registra como log `draw.generated`, no como auditoría.
- No se implementó `POST /api/client-log`; los `console.error` de componentes cliente se mantienen.
- La purga por retención no está automatizada (propuesta: 12 meses; auth 90 días). Pendiente cuando haya uso productivo.
- Si el nombre de una clave coincide con `pass|token|secret|auth|cookie|hash|key|credential|session|jwt|otp|signature` se redacta (también en metadata de auditoría; por eso el flag de cambio de contraseña se llama `pwChanged`).
- `src/app/privacy/page.tsx` menciona el registro de eventos (IP/navegador en login).
