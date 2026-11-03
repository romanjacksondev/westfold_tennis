# Arquitectura de Westfold Tennis

Aplicación web para gestionar un club de tenis: jugadores, torneos (round robin, playoffs o mixto), cuadros/sorteos, resultados, niveles y ranking.

## Contenido de esta carpeta

| Documento | Qué cubre |
|---|---|
| Este archivo | Visión general: stack, librerías, datos, seguridad, logging, despliegue, tests |
| [estructura-de-carpetas.md](./estructura-de-carpetas.md) | Convenciones de organización del código |
| [ciclo-de-vida-del-torneo.md](./ciclo-de-vida-del-torneo.md) | Estados del torneo, transiciones y reglas de negocio |

## 1. Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) con `cacheComponents` y `partialPrefetching` activos (`next.config.ts`) |
| UI | React 19, Tailwind CSS 4 + Flowbite React, CSS propio en `src/app/globals.css` |
| Lenguaje | TypeScript 5 (módulos ES, `type: module`) |
| Base de datos | PostgreSQL (17 en desarrollo) |
| ORM | Prisma 7 con el adaptador `@prisma/adapter-pg`; el cliente se genera en `prisma/generated/` |
| Autenticación | next-auth 4, proveedor Credentials, sesión JWT |
| Logging | pino (JSON estructurado) |
| Almacenamiento de archivos | Vercel Blob (fotos de jugadores) |
| Tests | `node --test` (unitarios), integración con API real, Playwright (e2e) |
| Node | `>=20` |

> Next.js 16 tiene cambios incompatibles con versiones previas. Antes de escribir código específico de Next, leer la guía en `node_modules/next/dist/docs/` (ver `AGENTS.md`).

## 2. Librerías y para qué se usan

| Librería | Uso |
|---|---|
| `next`, `react`, `react-dom` | Framework y render |
| `next-auth` | Login con usuario/contraseña, sesión JWT, roles en el token |
| `bcryptjs` | Hash y verificación de contraseñas (login y alta/edición de usuarios) |
| `@prisma/client`, `@prisma/adapter-pg`, `pg` | Acceso a Postgres |
| `prisma` (dev) | Migraciones, generación del cliente, seed |
| `@vercel/blob` | Subida y borrado de fotos de jugadores (`/api/players/[id]/photo`) |
| `flowbite`, `flowbite-react` | Componentes base (navbar, tarjetas) |
| `tailwindcss`, `@tailwindcss/postcss` | Estilos utilitarios |
| `@tanstack/react-table` | Tablas (`SimpleTable`, venues, torneos) |
| `react-icons` | Íconos |
| `date-fns` | Formato de fechas |
| `pino` | Logs estructurados con redacción de datos sensibles |
| `@playwright/test` (dev) | Tests e2e |
| `tsx` (dev) | Ejecuta el seed de Prisma |
| `eslint`, `eslint-config-next`, `prettier` (dev) | Lint y formato |

## 3. Estructura de código (resumen)

```text
src/
├── app/               Rutas (páginas y route handlers en app/api)
├── components/
│   ├── ui/            Piezas reutilizables (Card, NavBar, ConfirmDialog, SimpleTable, PlayerPhoto…)
│   └── features/      Componentes con lógica de dominio (admin, players, tournaments, draws…)
├── lib/               Lógica de servidor: auth, auditoría, logging, sorteo, resultados
├── utils/             Utilidades puras y testeables: scoring, levels, draw-engine, prisma
├── hooks/, types/
└── proxy.ts           Protección de rutas (ex middleware)
prisma/                schema, migraciones, seed
scripts/run-integration.mjs   Orquesta tests de integración/e2e
tests/{integration,e2e}
docs/
```

## 4. Dominio y modelo de datos (`prisma/schema.prisma`)

- **Player**, **User** (rol `USER`/`ADMIN`; un usuario puede estar vinculado a un jugador).
- **Level** y **PlayerLevelHistory**: nivel declarado del jugador, con historial.
- **Tournament** (`TournamentStatus`: borrador → en curso → terminado/cancelado), con **Surface**, **Venue**, **TournamentType**, **TournamentCategory** y **TournamentCategoryPoints** (puntos por posición).
- **DrawMatch** (`DrawStatus`, `DrawPhase`): cuadro/sorteo persistido, nodos con clave `FASE:ronda:posición`, siembra y avance de ganadores.
- **Match** → **Set** → **Game**: resultado real; `Match.walkover` marca W.O.
- **AuditLog**: trazabilidad de acciones.
- Borrado lógico (`deletedAt`) en casi todas las entidades.

### Lógica pura (testeable sin base)
- `src/utils/scoring.ts`: puntos por posición/etapa.
- `src/utils/levels.ts`: sugerencias de subida/bajada de nivel (racha de `SUGGESTION_STREAK`).
- `src/utils/draw-engine.ts`: generación de cuadros (siembra, byes, round robin, playoffs).
- `src/utils/utils.ts`: estadísticas de jugadores y tabla de posiciones (desempate por head-to-head).

### Lógica de servidor
- `src/lib/draw-service.ts`, `draw-persistence.ts`, `draw-results.ts`: generar, guardar, confirmar y consultar cuadros; avanzar ganadores; tabla y campeón en vivo.
- `src/lib/match-sets.ts`: arma sets/games desde el payload; compartido por alta y corrección de partidos.
- `src/lib/player-level.ts`: nivel actual, historial y sugerencia.

## 5. API (`src/app/api`)

| Ruta | Función |
|---|---|
| `/api/auth/*` | next-auth |
| `/api/health` | Chequeo público de salud (verifica la base) |
| `/api/home`, `/api/leaderboard`, `/api/tournaments`, `/api/venues` | Lecturas públicas o de sesión |
| `/api/matches` | Partidos, resumen y `playerStats` (opcional `?id=<torneo>`) |
| `/api/players`, `/api/players/[id]/stats`, `/api/players/[id]/photo` | Jugadores, estadísticas históricas, foto |
| `/api/stats/*` | H2H e historial |
| `/api/add-match` | Alta de resultado |
| `/api/admin/[resource]` y `/[id]` | CRUD administrativo (solo ADMIN), acciones de torneo (`start`, `finish`, cancelar, reactivar) y corrección de partidos |

Todos los handlers se envuelven con `withApiLogging` (requestId, duración, 500 controlado).

## 6. Seguridad y acceso

- `src/proxy.ts` exige sesión en todo salvo rutas públicas (`/`, `/leaderboard`, `/information`, `/auth/signin`, `/privacy`, `/terms`, `/api/health`, `/api/home`, `/api/leaderboard`, lectura de fotos).
- Sin sesión: las APIs devuelven 401 y las páginas redirigen a `/auth/signin?callbackUrl=…`.
- Roles `USER` y `ADMIN` van en el JWT; `src/lib/require-session.ts` valida permisos en los handlers. El dashboard y las acciones administrativas son solo ADMIN.
- Contraseñas con bcrypt. Logs con redacción de `password`, `token`, `cookie`, `authorization`, `secret`, `hash`.

## 7. Observabilidad y auditoría

- `src/lib/logger.ts`: pino, nivel por `LOG_LEVEL` (default `debug` en dev, `info` en prod), campos base `service` y `env`, contexto de request (`requestId`, `route`, `method`).
- `src/lib/log-sanitize.ts`: sanitiza valores y serializa errores.
- `src/instrumentation.ts` / `instrumentation-node.ts`: arranque y reporte de errores de request (`onRequestError`).
- `src/lib/audit.ts`, `admin-audit.ts`, `audit-diff.ts`: `AuditLog` con actor, entidad, before/after y metadata (incluye `requestId`). Visible en la pestaña «Auditoría» del dashboard.
- Los logs salen por stdout; en Vercel quedan en los Runtime Logs de la plataforma. Plan original: [auditoría y logging](../planes/finalizados/audit-logging-plan.md).

## 8. Despliegue (lo que sabemos hoy)

- Se despliega en **Vercel**. No hay `vercel.json`: se usa la configuración por defecto de Next.js.
- Build: `npm run build` (`prisma generate && next build`). `postinstall` también genera el cliente.
- Variables de entorno usadas en el código: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_DEBUG`, `LOG_LEVEL`, y las de Vercel `VERCEL_ENV` / `VERCEL_GIT_COMMIT_SHA` (para logs). `@vercel/blob` requiere su token de Blob (`BLOB_READ_WRITE_TOKEN`) en Vercel.
- Base de datos: Postgres externo apuntado por `DATABASE_URL`. **Pendiente de documentar**: proveedor concreto, política de backups y procedimiento de restauración (ver plan de operación del club).
- Las migraciones (`prisma/migrations`) **no** se aplican en el build; hay que ejecutar `prisma migrate deploy` contra la base de producción al desplegar cambios de esquema.
- Nota: `backup.sql` y `prisma/backup.sql` están en el repo.

## 9. Entorno local

- Postgres con `docker/docker-compose.yml` (Postgres 17).
- `.env` con `DATABASE_URL` y `NEXTAUTH_SECRET`.
- `npx prisma migrate dev` y `npx prisma db seed` (`prisma/seed.ts`).
- `npm run dev`. Tras cambiar el esquema, reiniciar `next dev` (el cliente de Prisma queda desactualizado).

## 10. Tests

| Comando | Qué hace |
|---|---|
| `npm test` | Unitarios con `node --test` (scoring, levels, utils, draw-engine, log-sanitize, audit-diff) |
| `npm run test:coverage` | Unitarios con umbral de cobertura 80% |
| `npm run test:integration` | API real contra un schema Postgres aislado y temporal (`scripts/run-integration.mjs`) |
| `npm run test:e2e` | Playwright; **solo se ejecuta cuando se pide explícitamente** |
| `npm run typecheck`, `npm run lint`, `npm run format:check` | Calidad estática (el lint tiene errores previos conocidos) |

Después de correr tests o builds, restaurar `next-env.d.ts` (`git checkout next-env.d.ts`).

## 11. Decisiones técnicas relevantes

- Con `cacheComponents`, los hooks de ruta (`usePathname`) en layouts exigen `Suspense` (ver `SiteContent.tsx`), y los handlers dinámicos usan `connection()`.
- El campeón se calcula desde el cuadro y se guarda en `Tournament.championId` como caché.
- El sorteo se confirma automáticamente al iniciar el torneo; hay que generarlo antes de iniciar.
- Las estadísticas mostradas deben calcularse siempre desde datos reales (ver [reglas](../reglas/README.md)).
