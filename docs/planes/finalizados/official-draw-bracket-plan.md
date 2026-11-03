# Plan: Sorteo oficial guardado y cuadro que avanza con los resultados

Estado: **Implementado**.

## Contexto y problema

- `GET /api/tournaments/[id]/draw` genera una **vista previa nueva en cada request** (`shuffle` + `buildEliminationBracket`/`generateDraw` de `src/utils/utils.ts`). El orden cambia cada vez y no existe un «sorteo oficial».
- Los partidos se cargan sueltos (`POST /api/add-match`) y solo se vinculan al torneo y a una `stage` (`MatchStage`). El cuadro no sabe qué partido le corresponde ni avanza al ganador.
- `buildEliminationBracket` empareja `slot i` vs `slot size-1-i`. Con 8 jugadores, los cabezas de serie 1 y 2 se cruzan en **semifinales** (1v8, 2v7 → ganadores se enfrentan). Para sembrar bien hace falta la colocación estándar (1 y 2 en mitades opuestas).
- La final de un torneo y el campeón se registran a mano (`championId`).

## Objetivo

1. El admin genera un sorteo, lo revisa (puede re-sortear o intercambiar jugadores) y lo **confirma**; desde ahí queda fijo y es el cuadro oficial.
2. Cada casillero del cuadro corresponde a un partido real: al cargar el resultado, el ganador avanza solo a la ronda siguiente.
3. En Round Robin (+ Playoffs), la tabla de posiciones se calcula sola y, al terminar la fase de grupos, llena el cuadro de playoffs.
4. Sorteo verificable y auditado (semilla guardada, eventos de auditoría).

## Fuera de alcance (compatible a futuro)

Horarios y canchas (el `DrawMatch` queda listo para sumar `scheduledAt`/`courtId`), formatos nuevos (consolación, dobles, doble eliminación: ver `tournament-formats-plan.md`), walkover/retiro, inscripción online (`player-registration-plan.md`).

## Decisiones de diseño

| Tema | Decisión |
|---|---|
| Aleatoriedad | PRNG determinista (mulberry32) alimentado por `drawSeed` (string) guardado en el torneo. Mismo seed + mismos participantes ⇒ mismo cuadro. Re-sortear genera un seed nuevo. |
| Siembra | `seedMode`: `NONE` (todo al azar), `RANKING` (por puntos del ranking, `calculatePlayerPoints`), `LEVEL` (por `Level.order`), `MANUAL` (el admin ordena). Cantidad de cabezas de serie = `min(nextPow2(n)/2, 8)` configurable. |
| Colocación | Algoritmo estándar: semillas 1 y 2 en mitades opuestas, 3 y 4 en cuartos opuestos, etc. Resto al azar. **BYEs a las mejores semillas.** |
| Tamaño efectivo | `drawSize` sigue siendo el **cupo**. Al confirmar, el cuadro usa `n = jugadores confirmados`; playoffs → `nextPow2(n)` con `nextPow2(n) - n` BYEs; round robin → impar = «descansa» por jornada (ya lo hace `generateDraw`). Las «Vacante» desaparecen del cuadro oficial. |
| Fases | `GROUP` (todos contra todos, por jornada) y `PLAYOFF` (eliminación). Round Robin + Playoffs usa ambas; los `qualifiers` (default 2) definen el tamaño del playoff. |
| Avance | Cada `DrawMatch` apunta a `nextDrawMatchId` + `nextSlot` (1 o 2). Al cargar un resultado se asigna el ganador al siguiente casillero. Los BYEs se resuelven al confirmar. |
| Playoff tras grupos | Los casilleros se llenan con `PlayerSource = GROUP_POSITION n`. Cuando todos los partidos de grupo tienen resultado se calcula la tabla (con `compareStandings` de `src/utils/scoring.ts`) y se asignan 1.º, 2.º… Empate irresoluble ⇒ el admin elige el orden (acción `set-group-order`). |
| Torneos existentes | **Sin modo legado.** `drawStatus = NONE` solo significa «todavía sin sorteo» (torneos en preparación). Todo torneo `IN_PROGRESS`/`FINISHED` debe tener sorteo `CONFIRMED` y partidos enlazados. Como la app no tiene uso productivo, se actualiza `prisma/seed.ts` para generar `DrawMatch` consistentes con los partidos de prueba (ver «Seed y datos consistentes»). |
| Etapas profundas | `MatchStage` llega hasta `ROUND_OF_16`. Un cuadro de 32 (que `MAX_PREVIEW_SLOTS` ya permite) necesita `ROUND_OF_32`: agregar el valor al enum, a `PLAYOFF_STAGE_RANK`/`ELIMINATED_POSITION` (posición 17) en `scoring.ts` y a `DRAW_STAGE_ORDER`. |

## Modelo de datos (Prisma)

```prisma
enum DrawStatus { NONE DRAFT CONFIRMED }
enum DrawPhase  { GROUP PLAYOFF }

model Tournament {
  // …campos existentes
  drawStatus      DrawStatus @default(NONE)
  drawSeed        String?
  drawSeedMode    String?            // NONE | RANKING | LEVEL | MANUAL
  drawConfirmedAt DateTime?
  drawMatches     DrawMatch[]
}

model DrawMatch {
  id             String    @id @default(cuid())
  tournamentId   String
  tournament     Tournament @relation(fields: [tournamentId], references: [id], onDelete: Cascade)
  phase          DrawPhase
  round          Int                 // jornada o ronda (1 = primera)
  position       Int                 // índice dentro de la ronda
  stage          MatchStage?         // derivada para PLAYOFF; GROUP para grupos
  player1Id      String?
  player2Id      String?
  seed1          Int?
  seed2          Int?
  source1        Json?               // { type: 'GROUP_POSITION', position: 1 }
  source2        Json?
  isBye          Boolean   @default(false)
  nextDrawMatchId String?
  nextSlot       Int?                // 1 | 2
  matchId        String?   @unique   // partido real jugado
  match          Match?    @relation(fields: [matchId], references: [id], onDelete: SetNull)

  @@unique([tournamentId, phase, round, position])
  @@index([tournamentId])
}
```

Migración nueva (`prisma migrate dev`), `npx prisma generate`. Sin cambios en `Match` salvo la relación inversa.

## Lógica pura (`src/utils/draw-engine.ts`, sin imports de Prisma, testeable con `node --test`)

- `createRng(seed: string)`: PRNG determinista.
- `seedPositions(size)`: orden estándar de casilleros para `size` potencia de 2.
- `buildPlayoffBracket(entrants, size)`: devuelve nodos `{round, position, player1/2, seed, isBye, next}`; resuelve BYEs (avance automático, `advancedByBye`).
- `buildGroupFixture(playerIds)`: usa `generateDraw` (método del círculo) y devuelve `{round, position, player1Id, player2Id}`.
- `placeEntrants({players, seeds, seedMode, rng})`: aplica siembra + azar.
- `advanceWinner(nodes, drawMatchId, winnerId)` y `revertAdvance(nodes, drawMatchId)`: devuelven los cambios a aplicar.
- `resolveGroupQualifiers(standings, qualifiers)`: toma la tabla ordenada.
- Mapeo `stageForRound(round, totalRounds)` ⇒ `FINAL`, `SEMIFINAL`, `QUARTERFINAL`, `ROUND_OF_16`, `ROUND_OF_32`.

`buildEliminationBracket` y `generateDraw` se conservan para el modo legado y se reutiliza el segundo.

## API

Admin (todas con `requireAdmin`, `withApiLogging` y auditoría):

| Endpoint | Acción |
|---|---|
| `POST /api/admin/tournaments/[id]/draw` `{action:'generate', seedMode, seeds?}` | Crea/reemplaza el sorteo en `DRAFT` (solo `PREPARATION`). Valida ≥ 2 jugadores y tipo configurado. |
| `… {action:'reshuffle'}` | Nuevo `drawSeed`, mismas reglas de siembra. |
| `… {action:'swap', a, b}` | Intercambia dos jugadores de casilleros de primera ronda (solo `DRAFT`). |
| `… {action:'confirm'}` | Transacción: `drawStatus=CONFIRMED`, `drawConfirmedAt`, bloquea participantes, resuelve BYEs. |
| `… {action:'discard'}` | Borra el borrador (no permitido si `CONFIRMED`; para eso hace falta volver a `PREPARATION` sin partidos). |
| `… {action:'set-group-order', order[]}` | Desempate manual de la tabla de grupos. |

Lectura:
- `GET /api/tournaments/[id]/draw`: si `CONFIRMED`, devuelve el cuadro oficial con resultados (`official: true`); si `DRAFT`, solo para admin (`official: false`); si `NONE`, la vista previa actual (`official: false`). El shape actual (`configured`, `type`, `rounds`, `groupRounds`, `bracketRounds`) se mantiene y se agregan `official`, `drawMatchId`, `matchId`, `score`.
- `GET /api/admin/tournaments/[id]/draw/pending`: partidos listos para jugar (ambos jugadores definidos y sin `matchId`).

Resultados:
- `POST /api/add-match` acepta `drawMatchId`. Con él: valida que el casillero esté listo, que `idPlayer1/2` coincidan, que el ganador sea uno de los dos y que no tenga ya `matchId`; fuerza `tournamentId` y `stage` del casillero; en una **transacción** crea el `Match`, enlaza `DrawMatch.matchId` y avanza al ganador. **`drawMatchId` es obligatorio**: solo se cargan partidos de torneo; sin él ⇒ 400. Los amistosos no se pueden cargar por ahora.
- Edición y archivado de partidos (`PATCH/DELETE /api/admin/matches/[id]`): si cambia el ganador o se archiva, se aplica `revertAdvance`; si el siguiente partido ya tiene resultado ⇒ **409** con mensaje («primero corregí el partido siguiente»).

Ciclo de vida (`PATCH /api/admin/tournaments/[id]` `action: 'start'`): además de las validaciones actuales exige `drawStatus === 'CONFIRMED'`. Actualizar `docs/arquitectura/ciclo-de-vida-del-torneo.md`.

Campeón:
- **Se calcula desde el torneo** (ganador de la final; en round robin, 1.º de la tabla con `compareStandings`) mediante una función pura `computeChampion`.
- Al cerrar el torneo (`FINISHED`) se **guarda** en `championId` como caché para consultas rápidas; el cálculo es la fuente de verdad.
- **Corrección posterior** (poco frecuente, por error de carga): el admin puede corregir un resultado de un torneo terminado. Al hacerlo se recalcula el campeón y se actualiza `championId` en la misma transacción. La UI exige un **motivo**, muestra una advertencia explícita («este torneo ya terminó; la corrección puede cambiar el campeón y los puntos del ranking») con el campeón anterior y el nuevo, y se registra en `AuditLog` (`TOURNAMENT_CORRECTION`, before/after de partido, campeón y motivo). Las reglas de 409 por partidos siguientes siguen valiendo.
- Un test verifica que `championId` guardado == `computeChampion` para todos los torneos terminados.

## UI

- **Preparación** (`TournamentPreparationModal` / `TournamentDrawPreview`): pasos Participantes → Siembra → Vista del sorteo (re-sortear, intercambiar, ver semilla) → Confirmar. Mostrar claramente «Borrador» vs «Oficial».
- **Carga de resultados** (`DashboardConsole`): en torneos con sorteo oficial, el formulario de nuevo partido elige de la lista de **pendientes del cuadro** (ya trae jugadores y fase); se elimina el formulario libre (no hay amistosos ni torneos legados).
- **Cuadro público** (`/draws`, `/tournaments/[id]`): cuadro oficial con marcadores y ganador resaltado, jornadas y tabla de posiciones; reutilizar `src/utils/draw-view.ts` (`buildGroupMatrix`, `getSideSetScores`).

## Auditoría y logging

- Agregar a `AuditAction`: `DRAW_RESHUFFLE`, `DRAW_SWAP`, `DRAW_CONFIRM`, `DRAW_DISCARD`, `DRAW_GROUP_ORDER` (y usar `DRAW_GENERATE`, que hoy existe pero no se emite). Guardar `drawSeed`, `seedMode` y entrantes en `metadata`/`after`.
- Renombrar el log actual `draw.generated` del GET a `draw.previewed` (hoy es una vista previa, no persiste).
- Eventos de avance: `draw.advance`, `draw.revert` (nivel info).

## Pruebas

- **Unitarias** (`draw-engine.test.ts`, agregado al script `npm test`): colocación estándar (1 y 2 en mitades opuestas para n=4/8/16/32), BYEs a mejores semillas, determinismo por seed, `buildGroupFixture` con n impar, `advanceWinner`/`revertAdvance`, mapeo de etapas, `resolveGroupQualifiers` con empates.
- **Integración** (`tests/integration/api.test.ts`): generar → re-sortear → intercambiar → confirmar; no se puede tocar participantes tras confirmar; cargar resultado hace avanzar al ganador; resultado con jugadores que no corresponden ⇒ 400; corregir ganador con siguiente jugado ⇒ 409; Round Robin + Playoffs llena el playoff al cerrar grupos; torneo legado sigue funcionando; auditoría de cada acción.
- **E2E**: flujo admin completo de torneo de 4 jugadores (sorteo → resultados → final → campeón).
- `npm run typecheck`, `npm run lint` (sin nuevos errores), `npm test`, `npm run test:integration`, `npm run test:e2e`.

## Fases / PRs sugeridos

1. Lógica pura + tests (`draw-engine.ts`, `ROUND_OF_32` en enum y scoring).
2. Migración + servicio de sorteo + endpoints admin + auditoría.
3. Carga de resultados enlazada, avance, reversión y bloqueos 409.
4. UI: asistente de sorteo, pendientes, cuadro público con resultados.
5. Ciclo de vida (`start`, cierre con campeón sugerido), actualización de `docs/arquitectura/ciclo-de-vida-del-torneo.md`, moverlo a `docs/planes/finalizados/`.

## Seed y datos consistentes

- `prisma/seed.ts` (≈5000 líneas, torneos y partidos fijos) se actualiza para que cada torneo `IN_PROGRESS`/`FINISHED` tenga `drawStatus = CONFIRMED`, `drawSeed`, y `DrawMatch` vinculados a cada `Match` (por `stage` y jugadores), con el `championId` coherente con la final.
- Se agrega un helper en el seed que **reconstruye el cuadro a partir de los partidos existentes** (usando `draw-engine.ts`), en vez de escribir `DrawMatch` a mano; falla si los datos no cierran (ganador que no avanza, partido sin casillero, campeón ≠ ganador de la final). Donde los datos de prueba sean inconsistentes se corrigen o se eliminan partidos.
- Torneos en `PREPARATION` quedan sin sorteo (`NONE`); se incluye al menos uno con sorteo `DRAFT` para probar la UI.
- `prisma/seed.test.ts` agrega verificaciones de consistencia: cada partido de torneo con sorteo tiene un `DrawMatch`, el ganador figura en el casillero siguiente y el campeón coincide con `computeChampion`.
- Esto se hace en el PR 2 (migración), y los tests de integración usan los mismos helpers.

## Riesgos

- Reglas de edición de partidos con avance en cadena (resuelto con 409 y mensaje claro).
- Datos de prueba antiguos que no cierran como cuadro (se corrigen en el seed; ver «Seed y datos consistentes»).
- Cálculo de puntos: sigue basándose en `Match.stage` y ganador, que se conservan; cubrir con tests que el puntaje de un torneo con sorteo coincide con el cálculo actual.

## Decisiones abiertas (con propuesta)

- ~~Partidos fuera de cuadro / amistosos~~ **Decidido**: por ahora solo partidos de torneo, siempre ligados a un casillero del cuadro. Los amistosos se evaluarán más adelante con un diseño coherente (`Match.tournamentId` sigue nullable en el esquema, pero la API no lo permite).
- ~~Campeón~~ **Decidido**: se calcula, se guarda al cerrar y se recalcula con corrección auditada y advertencia.
- ~~Torneos existentes~~ **Decidido**: sin modo legado; el seed se actualiza para ser consistente.
- ~~Semillas por ranking~~ **Decidido**: `RANKING` usa los puntos del ranking (`calculatePlayerPoints`), y el seed de datos de prueba debe dejar un ranking poblado para que la siembra por ranking funcione desde el inicio.

## Resultado

Implementado en 5 etapas (sin commits al cierre de este documento):

- **Motor y esquema**: `src/utils/draw-engine.ts` (con tests), `ROUND_OF_32`, modelo `DrawMatch`, `DrawStatus`/`DrawPhase`, campos `draw*` en `Tournament`.
- **Backend**: `src/lib/draw-persistence.ts`, `draw-service.ts`, `draw-results.ts`; endpoints `api/admin/draws/[id]` (generate, reshuffle, swap, confirm, discard, set-group-order) y `…/pending`; `GET /api/tournaments/[id]/draw` devuelve el sorteo oficial; `add-match` exige `drawMatchId`; acción `finish`; correcciones con motivo y `TOURNAMENT_CORRECTION`.
- **Seeds**: todos los torneos en curso/terminados tienen sorteo confirmado y partidos vinculados; demos en curso y en borrador; ranking poblado para la siembra `RANKING`.
- **UI**: `TournamentDrawPanel` (sorteo en el modal de preparación), `TournamentResultsModal` (pendientes, cierre, orden de tabla, correcciones), `DrawBracket` (admin y público).
- **Tests**: unit (`draw-engine`), integración (`describe('official draw')`) y e2e del flujo completo.

### Desvíos respecto del plan

- Los endpoints de admin viven en `api/admin/draws/[id]` (no `admin/tournaments/[id]/draw`) para no chocar con `admin/[resource]`.
- `add-match` pasó a requerir rol admin.
- Se eliminó la carga libre de partidos y la edición manual del campeón.
- La siembra `RANKING` usa la ventana móvil de 12 meses del leaderboard; jugadores con 0 puntos quedan sin sembrar.
