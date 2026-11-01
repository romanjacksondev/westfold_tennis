# Plan: Sorteo oficial guardado y cuadro que avanza con los resultados

Estado: **Pendiente** (listo para implementar).

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
| Torneos existentes | `drawStatus = NONE` (modo legado): se mantiene el comportamiento actual (vista previa + `add-match` libre). No hay backfill. |
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
- `POST /api/add-match` acepta `drawMatchId`. Con él: valida que el casillero esté listo, que `idPlayer1/2` coincidan, que el ganador sea uno de los dos y que no tenga ya `matchId`; fuerza `tournamentId` y `stage` del casillero; en una **transacción** crea el `Match`, enlaza `DrawMatch.matchId` y avanza al ganador. Sin `drawMatchId` en torneos con sorteo confirmado ⇒ 400 (salvo admin con motivo, queda auditado).
- Edición y archivado de partidos (`PATCH/DELETE /api/admin/matches/[id]`): si cambia el ganador o se archiva, se aplica `revertAdvance`; si el siguiente partido ya tiene resultado ⇒ **409** con mensaje («primero corregí el partido siguiente»).

Ciclo de vida (`PATCH /api/admin/tournaments/[id]` `action: 'start'`): además de las validaciones actuales exige `drawStatus === 'CONFIRMED'` cuando el tipo lo usa. Cierre: al completarse la final (o toda la tabla en round robin) la consola ofrece «Cerrar torneo» con el campeón precargado; el admin confirma (`championId` + `FINISHED`). Actualizar `docs/tournament-lifecycle-states.md`.

## UI

- **Preparación** (`TournamentPreparationModal` / `TournamentDrawPreview`): pasos Participantes → Siembra → Vista del sorteo (re-sortear, intercambiar, ver semilla) → Confirmar. Mostrar claramente «Borrador» vs «Oficial».
- **Carga de resultados** (`DashboardConsole`): en torneos con sorteo oficial, el formulario de nuevo partido elige de la lista de **pendientes del cuadro** (ya trae jugadores y fase); el formulario libre queda para torneos legados y amistosos.
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
5. Ciclo de vida (`start`, cierre con campeón sugerido), actualización de `tournament-lifecycle-states.md`, moverlo a `docs/finished/`.

## Riesgos

- Reglas de edición de partidos con avance en cadena (resuelto con 409 y mensaje claro).
- Compatibilidad con torneos antiguos (modo legado explícito, sin backfill).
- Cálculo de puntos: sigue basándose en `Match.stage` y ganador, que se conservan; cubrir con tests que el puntaje de un torneo con sorteo coincide con el cálculo actual.

## Decisiones abiertas (con propuesta)

- ¿Permitir cargar un partido «fuera de cuadro» en un torneo con sorteo oficial? Propuesta: no, salvo admin con motivo auditado.
- ¿El campeón se asigna solo al terminar la final? Propuesta: se precarga y el admin confirma.
- ¿Semillas por ranking usan la ventana anual o 12 meses? Propuesta: la que muestre el leaderboard por defecto.
