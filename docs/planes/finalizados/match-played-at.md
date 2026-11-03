# Plan: Fecha propia de cada partido

Estado: **Implementado**.

## Contexto

Los partidos usaban la fecha del torneo, pero pueden jugarse en días distintos. Se agrega `Match.playedAt` como registro real.

## Decisiones

1. `Match.playedAt DateTime?` (opcional). La migración `20261101000000_match_played_at` rellena los partidos existentes con la fecha de su torneo.
2. `POST /api/add-match` acepta `playedAt`; si falta, usa la fecha del torneo.
3. El formulario de nuevo partido incluye «Fecha del partido» (opcional).
4. El listado admin muestra, filtra y ordena por `playedAt`, con la fecha del torneo como respaldo (partidos creados por seeds sin fecha).

## Verificación

- `npm run typecheck`, `npm test`, `npm run test:e2e` (el E2E comprueba que la fecha elegida se guarda).
