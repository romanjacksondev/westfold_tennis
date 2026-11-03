# Puntuación según tipo de torneo

Estado: Implementado

## Reglas

Los puntos se suman solo cuando el torneo está `FINISHED`. Los torneos sin tipo se tratan como Round Robin.

| Tipo | Cómo suma |
|---|---|
| Round Robin | `pointsPerMatchWin` de la categoría por cada partido ganado |
| Playoffs | Puntos de la fase alcanzada: campeón (posición 1), finalista (2), semifinal (3-4), cuartos (5-8). No hay puntos por partido |
| Round Robin + Playoffs | Partidos ganados de la fase de grupos × `pointsPerMatchWin`, más los puntos de la fase alcanzada. Perder la primera ronda de playoffs no suma puntos por fase |

Los puntos por fase reutilizan `TournamentCategoryPoints` (posición 1, 2, 3-4, 5-8), por lo que no hay una tabla nueva. Los valores por partido ganado son un 10 % de los puntos del campeón de cada categoría y se pueden refinar desde la base de datos.

## Implementación

- `prisma/schema.prisma`: enum `MatchStage` (`GROUP`, `ROUND_OF_16`, `QUARTERFINAL`, `SEMIFINAL`, `FINAL`), `Match.stage` (nullable; sin fase = grupos) y `TournamentCategory.pointsPerMatchWin`.
- Migración `20261030170000_tournament_type_scoring`: crea lo anterior, calcula `pointsPerMatchWin` y asigna Round Robin a los torneos sin tipo.
- `src/utils/scoring.ts`: reglas puras (`calculateTournamentPoints`). `calculatePlayerPoints` en `src/utils/utils.ts` las usa.
- `src/utils/scoring.test.ts`: tests con `npm test` (`node --test`).
- `/api/add-match` acepta `stage`; el admin pide la fase al cargar partidos de torneos con playoffs.
- `/information` explica las reglas por formato y muestra puntos por partido y por fase.
- `prisma/seed.ts`: los torneos originales quedan como Round Robin y los demo cubren los tres formatos (con una final sorpresa).
