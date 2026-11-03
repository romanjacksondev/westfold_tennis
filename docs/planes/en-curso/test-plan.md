# Plan de tests y cambios asociados

Documento para retomar el trabajo en otra sesión. Marcar cada casilla al completarla.

## Estado de partida (2026-10-31)

- Runner inicial: `npm test` (`node --test`). 34 tests en `src/utils/scoring.test.ts` y `src/utils/levels.test.ts`.
- Sin tests: `src/utils/utils.ts`, APIs (`src/app/api/**`), componentes y flujos de UI.
- Restricción: los archivos testeados con `node --test` no pueden importar módulos con alias (`@/`) ni Prisma; mantener la lógica pura en archivos sin imports (como `scoring.ts` y `levels.ts`).
- Base de datos local: Docker `docker-db-1` (postgres 16, puerto 5433). Nunca usar `prisma migrate dev` ni reset sobre la base de desarrollo: hay una migración aplicada que no está en la carpeta. Para migraciones, SQL a mano + `npx prisma migrate deploy` + `npx prisma generate`.
- Otros trabajos pendientes fuera de este plan: ejecutar `prisma migrate deploy` en producción (scoring, quitar Humolabs, niveles) y asignar niveles a los torneos existentes; todo el trabajo reciente está sin commitear.

## Criterio de prioridad

1. Lógica pura que decide resultados o puntos.
2. APIs con base de datos real.
3. Flujos de UI y regresiones.

## Fase 1: lógica pura (sin infraestructura nueva)

### 1.1 Extraer lógica de componentes a funciones puras

- [x] Cuadro del torneo (`src/app/tournaments/[id]/page.tsx`): matriz de grupos, etapas del bracket y marcador con tiebreak (`7(7)-6(3)`). Mover a `src/utils/draw-view.ts` (sin imports).
- [x] Vista previa del cuadro (`src/components/features/admin/TournamentDrawPreview.tsx`): cantidad de partidos, tamaño de la llave (potencia de 2), BYE, clasificados. Mover el cálculo a una función pura.
- [x] Orden de partidos de `src/lib/player-level.ts` (fecha, etapa, desempate por id).
- [x] Regla de historial de nivel del admin (`src/app/api/admin/[resource]/[id]/route.ts`): solo crear historial si el nivel cambió.

### 1.2 Tests nuevos

- [x] `utils.test.ts` → `formatSetScore`: 6-4, 7-6(5), 7-5; tiebreak con puntos nulos; puntos del lado correcto.
- [x] `calculatePlayerStats`: victorias, derrotas, sets, games; sets con tiebreak; jugador sin partidos; orden con desempate (partido, sets, games, enfrentamiento directo).
- [x] `calculatePlayerPoints`: puntos y desglose por torneo; solo torneos terminados; jugadores con el mismo nombre no mezclan puntos.
- [x] `createH2H` (simétrico) y `createMatchSummary` (orden y etapa).
- [x] `countTournamentsByPlayer`.
- [x] `generateDraw` y `buildEliminationBracket`: cupos que no son potencia de 2 (BYE), avance automático sin partido ni puntos de victoria, cruce 1 vs último, nombres de rondas.
- [x] Ampliar `scoring.test.ts`: torneo en curso o cancelado = 0 puntos; mixto sin puntos de etapa al perder la primera ronda de playoffs; playoffs con BYE; categoría sin puntos para una posición.
- [x] Ampliar `levels.test.ts`: racha con un rival sin nivel en el medio; niveles reordenados; lista de niveles vacía.
- [x] Tests de las funciones extraídas en 1.1.

## Fase 2: APIs con base de datos real

### 2.1 Entorno

- [x] Esquema temporal `westfold_test_<id>` en el contenedor existente `docker-db-1`, con migraciones aplicadas por `prisma migrate deploy`.
- [x] Script `test:integration` pasa `DATABASE_URL` por entorno, sin leer ni modificar `.env`, y elimina solo el esquema aleatorio que creó.
- [x] Seed mínimo y determinista para tests (no el seed demo).

### 2.2 Casos

- [x] `/api/leaderboard`: filtros `all`, id de nivel y `none`; puntos independientes por jugador/nivel; «Todos» suma niveles; solo torneos terminados; períodos de 12 meses y año calendario; `hasTournamentsWithoutLevel`.
- [x] Admin: CRUD de niveles; historial por cambio de nivel y motivo; sin historial si no cambia; cambiar solo el nivel de torneo terminado conserva al campeón; otras ediciones rechazadas; inicio valida jugadores/cupos.
- [x] Autorización: sin sesión 401, sin rol admin 403.
- [x] `/api/matches`: `levelNote` por jugador y marcador con tiebreak; `/api/players/[id]/stats`: nivel actual e inclusión de sugerencia.
- [x] Acceso público vs privado según `src/proxy.ts` (`/api/leaderboard`, `/api/home`, `/information` públicas).
- [x] Migraciones: aplicar todas desde cero en cada esquema de integración y verificar niveles por defecto (C, B, B1, A, A1).

## Fase 3: UI

- [x] Playwright aprobado e integrado en el runner con Chromium y un esquema aislado por ejecución.
- [x] E2E visitante: cambiar categoría, período y nivel del ranking de home; filtrar ranking por nivel; navegar a Ranking y `/information` desde el sidebar.
- [x] E2E admin: crear un torneo de playoffs, comprobar el avance visible por BYE sin puntos de victoria, iniciar, cargar los partidos disputados y terminarlo eligiendo campeón.
- [x] Torneo terminado: verificar las etiquetas Campeón y Campeona y resultados con tiebreak.
- [x] Regresiones: comprobar errores runtime, hidratación y claves duplicadas en NavBar, Sidebar y vistas de torneo.
- [x] La creación de torneos conserva `drawSize` y `qualifiers`; un flujo E2E detectó y corrigió que esos valores se descartaban en el endpoint POST.
- [x] La vista previa del cuadro usa estilos separados de la miniatura del selector de formatos; E2E verifica que cada jugador agregado aparece en el cuadro visible.

## Fase 4: cobertura

- [x] Medir con `node --test --experimental-test-coverage` mediante `npm run test:coverage`.
- [x] Mínimo 80% de líneas y funciones en `scoring.ts`, `levels.ts` y `utils.ts`.

## Decisiones resueltas

1. Base: usar el Postgres existente, con un esquema aleatorio aislado por ejecución.
2. Playwright: aprobado para cubrir los flujos de UI que faltaban.
3. Alcance: implementar fases 2–4.
4. Cobertura: 80% mínimo de líneas y funciones.

## Mejoras registradas

- [x] Las funciones del ranking y el palmarés ahora agregan por ID de jugador, no por nombre; el mismo nombre ya no fusiona puntos/títulos y la UI usa IDs como claves estables.
- [x] La vista previa muestra el número real de clasificados y rellena la llave con BYEs sin convertir esos cupos en clasificados adicionales.
- [x] Los BYEs avanzan al participante visible en rondas posteriores; los huecos dobles no producen clasificados y el BYE no crea un partido ni puntos de victoria.
- [x] Aislar cada ejecución en un esquema PostgreSQL aleatorio `westfold_test_<id>` y limpiar solo ese esquema al terminar.

## Estado de ejecución

- `npm test`: 57 tests unitarios.
- `npm run test:integration`: 9 pruebas de API/páginas; esquema de prueba descartable.
- `npm run test:e2e`: ejecuta integración y 3 pruebas Playwright (visitante, torneo femenino terminado y ciclo admin completo); requiere `npx playwright install chromium`.
- `npm run test:coverage`: umbrales de 80% aplicados a líneas y funciones de los tres módulos.
- Fases 1–4 implementadas y automatizadas; base de integración eliminada al finalizar cada ejecución.
