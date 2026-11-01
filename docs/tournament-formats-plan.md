# Plan (para revisar): Más formatos de torneo

Estado: **Pendiente de revisión**. Interesante, no es prioridad inmediata.

## Situación actual

- Tipos: `Playoffs`, `Round Robin`, `Round Robin + Playoffs` (`TournamentType`, reconocidos por nombre en `getTournamentKind`, `src/utils/scoring.ts`).
- Cada partido tiene exactamente dos jugadores (`player1`, `player2`), sin estado intermedio; el nivel del torneo es solo una etiqueta; el formato de sets no se configura por torneo.
- Etapas soportadas: `GROUP`, `ROUND_OF_16`, `QUARTERFINAL`, `SEMIFINAL`, `FINAL`.

## Formatos propuestos (en orden de valor/esfuerzo)

| # | Formato | Qué agrega | Esfuerzo |
|---|---|---|---|
| 1 | **Cuadro de consolación** (quien pierde en la 1.ª ronda sigue) | Más partidos por jugador, muy pedido en clubes | Medio |
| 2 | **Formato de partido configurable por torneo** (mejor de 3, 1 set, súper tiebreak en lugar del 3.º set, sets a 4 games) | Validaciones de marcador según formato | Bajo-medio |
| 3 | **Torneos por niveles dentro de un evento** (A, B, C con sorteo propio) | Un evento con varios cuadros | Medio |
| 4 | **Grupos múltiples** (ej. 2 grupos de 4 + cruces) | Torneos de 8–16 jugadores | Medio |
| 5 | **Eliminación doble** | Segunda oportunidad rigurosa | Alto |
| 6 | **Dobles** | Parejas como participantes | Alto (cambia el modelo de partido) |
| 7 | **Liga larga / escalera por desafíos** | Competencia continua | Alto |

## Diseño general

- Pasar de reconocer el formato por **nombre** a una configuración explícita: `TournamentType.engine` (`ELIMINATION`, `ROUND_ROBIN`, `GROUPS_PLAYOFFS`…) + parámetros (`groupCount`, `qualifiersPerGroup`, `consolation: boolean`, `matchFormat`).
- Apoyarse en el motor de sorteo persistido de `official-draw-bracket-plan.md`: cada formato nuevo es un **generador de `DrawMatch`** distinto (consolación = segunda rama con `nextDrawMatchId` de perdedores: agregar `loserNextDrawMatchId`).
- **Elegibilidad**: `Tournament.minLevelId/maxLevelId`, `gender`; validar en la inscripción y al armar el sorteo.
- **Dobles**: nueva entidad `Team` (2 jugadores) y `Match.team1Id/team2Id`; ranking separado. Requiere revisar estadísticas, H2H y puntos; tratarlo como proyecto aparte.
- **Puntos**: cada formato define su tabla de posiciones finales (ver `ranking-points-plan.md`).

## Riesgos

- El modelo actual asume 2 jugadores individuales en todo el código (stats, H2H, ranking).
- Complejidad de UI del cuadro con ramas múltiples.
- Reglas de puntaje distintas por formato.

## Para decidir al revisar

- ¿Qué formato piden los socios primero? Mi sugerencia: consolación + formato de partido configurable.
- ¿Los torneos por niveles reemplazan o conviven con la etiqueta `levelId` actual?
- ¿Dobles entra en el roadmap del club?
