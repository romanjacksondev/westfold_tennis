# Plan: Leaderboard por género + datos de prueba

**Estado:** Implementado

## Objetivo
1. Quitar el texto aclaratorio bajo los tabs ("Ventana móvil acumulada de los últimos 365 días.").
2. Agregar el género a los jugadores y mostrar tablas separadas de Hombres y Mujeres en `/leaderboard`.
3. Cargar datos de prueba en la BD para ver el diseño.

## 1. Quitar texto aclaratorio
- `src/components/features/leaderboard/components/Leaderboard.template.tsx` (~líneas 95-101): eliminar el bloque con el ícono de info y el texto `rankingMode === 'year' ? 'Ventana móvil...' : ...` (también la variante de año calendario).
- Eliminar imports/estilos que queden sin uso.

## 2. Género y tablas separadas
**Base de datos**
- `prisma/schema.prisma`: `enum Gender { MALE FEMALE }` y `Player.gender Gender?` (nullable para no romper los 5 jugadores existentes).
- Migración: `npx prisma migrate dev --name add_player_gender`, luego `prisma generate`. Backup previo de la BD (`docker exec docker-db-1 pg_dump ...`).
- Backfill de jugadores existentes (manual o en el seed).

**API** (`src/app/api/leaderboard/route.tsx`)
- Incluir `gender` del jugador en la consulta y devolver `{ male: Entry[], female: Entry[] }` ordenados por puntos (jugadores sin género: excluidos del ranking, o grupo aparte; **decidir**).
- Mantener `await connection()` y los dos modos (`year` / `calendar`).

**Admin / tipos**
- `src/types/index.tsx`: agregar `gender`.
- `src/app/api/admin/[resource]/route.ts`, `[id]/route.ts`, `DashboardConsole.tsx` y formularios de jugadores: campo select "Género" (Hombre/Mujer).

**UI**
- `Leaderboard.tsx`: el cache pasa a guardar `{ male, female }` por modo.
- `Leaderboard.template.tsx`: renderizar dos tablas con título "Hombres" y "Mujeres", reutilizando el markup actual de la tabla; estado vacío por tabla; spinner y error sin cambios.

## 3. Datos de prueba
- `prisma/seed.ts` (`prisma.player.createMany`, ~línea 260): agregar `gender` a los 4 jugadores actuales y sumar ~8 jugadores (4-6 mujeres, algunos hombres) con IDs fijos.
- Agregar torneos `FINISHED` dentro de los últimos 12 meses y del año calendario actual, con `tournamentCategoryPoints`, partidos, sets y games mínimos para que ambas tablas tengan puntos.
- Mantener idempotencia (`skipDuplicates`); fechas relativas a "hoy" para que no caduquen en la ventana de 365 días.
- Ejecutar: `npx prisma db seed` contra `westfold` (Docker, puerto 5433) tras el backup.
- Alternativa: script separado `prisma/seed-demo.ts` para no engordar el seed (ya de 5000 líneas). **Recomendada.**

## Validación
- `npm run typecheck`, `npm run build`, `npx eslint` sobre archivos tocados.
- `curl /api/leaderboard?rankingMode=year` y `calendar`.
- Revisión visual de `/leaderboard` en ambos tabs.

## Riesgos / decisiones pendientes
- ¿Género nullable u obligatorio? (se propone nullable).
- ¿Jugadores sin género se ocultan?
- ¿Se mantiene el pill "Últimos 12 meses"?
- Los datos de prueba van a la BD local `westfold`; no usar en producción.
