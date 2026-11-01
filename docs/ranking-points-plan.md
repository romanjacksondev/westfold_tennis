# Plan (para revisar): Ranking y puntos

Estado: **Pendiente de revisión**.

## Situación actual

- Puntos por torneo: `calculateTournamentPoints` (`src/utils/scoring.ts`) suma puntos por posición final (`TournamentCategoryPoints`) más `pointsPerMatchWin` por victoria.
- Solo cuentan torneos `FINISHED`; hay ventanas «año calendario» y «últimos 12 meses», filtro por nivel y por género (`/api/leaderboard`).
- Desempates de tablas: `compareStandings` (head-to-head, sets, games).
- El nivel del jugador se sugiere con `src/utils/levels.ts` y se cambia a mano con historial (`PlayerLevelHistory`).

## Mejoras propuestas

1. **Desglose de puntos por torneo** para el jugador: «Torneo X, semifinal: 30 pts + 2 victorias × 5 = 40». Reduce reclamos; ya existen `matchPoints` y `stagePoints` en `PlayerTournamentPoints`, falta exponerlos en `/api/players/[id]/stats` y en el perfil.
2. **Temporadas**: entidad `Season` (nombre, inicio, fin). Ranking por temporada con cierre y archivo (el «anual» actual pasa a ser una temporada). Permite «campeón de la temporada».
3. **Historial de ranking**: foto (`RankingSnapshot`: temporada, fecha, jugador, puntos, posición) tras cada torneo terminado, para ver la evolución y movimientos de posición (+2, −1).
4. **Reglas de puntaje configurables** por categoría: bonus por derrotar a un jugador de nivel superior, penalización por no presentación, puntos por participación. Mantener `scoring.ts` puro y testeado.
5. **Cálculo consistente**: hoy los puntos se recalculan al consultar. Evaluar guardar el resultado al cerrar el torneo (`TournamentResult`: jugador, posición final, puntos) y usarlo como fuente única para leaderboard, perfil y exportes; recalcular con una acción de admin si cambian reglas. Beneficio: auditable y más rápido.
6. **Clasificación a un torneo final / Masters**: top N de la temporada por puntos, con `qualifiers` automáticos para armar el cuadro final.
7. **Cambios de nivel con flujo**: la sugerencia pasa a un estado `PROPOSED` → el admin aprueba → se notifica al jugador (con `notifications-and-share-images-plan.md`).

## Datos y migración

- Nuevas tablas: `Season`, `RankingSnapshot`, `TournamentResult`. Migración con backfill: calcular `TournamentResult` de todos los torneos `FINISHED` con `scoring.ts` y comparar contra el leaderboard actual antes de cambiar la fuente.
- No cambiar las reglas vigentes sin versionarlas: guardar en el resultado la versión de reglas usada.

## Pruebas

- Unitarias de cada regla nueva en `scoring.ts`.
- Test de equivalencia: el leaderboard calculado desde `TournamentResult` == el actual para los datos de prueba.
- Integración: cerrar un torneo genera resultados y snapshot; reabrir/cancelar los revierte.

## Riesgos

- Cambiar reglas modifica rankings pasados (por eso el versionado y el backfill con comparación).
- Torneos reactivados o editados tras terminar (el estado actual permite cambios de nivel): definir cuándo se recalcula.

## Para decidir al revisar

- ¿Ranking por temporada reemplaza el «últimos 12 meses» o conviven?
- ¿Hay bonus por nivel del rival? Es la regla que más debate genera en clubes.
- ¿Se quiere un torneo final (Masters)?
