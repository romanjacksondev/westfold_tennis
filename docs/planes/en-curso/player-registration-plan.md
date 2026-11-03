# Plan (futuro): Inscripción online de jugadores

Estado: **Idea guardada, muy a futuro**. No está en el alcance actual.

## Problema

Hoy solo un admin carga los participantes (`Tournament.players`, `playerIds` en el panel). El cupo se controla con `drawSize`, pero no hay apertura/cierre de inscripción, lista de espera ni confirmación del jugador.

## Objetivo

Que un jugador con cuenta se anote solo a un torneo abierto, y que el admin vea y gestione las inscripciones sin cargar todo a mano.

## Alcance propuesto

1. **Ventana de inscripción**: `registrationOpensAt`, `registrationClosesAt`, `capacity` (= `drawSize`).
2. **Estados de inscripción**: `PENDING` → `CONFIRMED` / `WAITLIST` / `REJECTED` / `WITHDRAWN`.
3. **Elegibilidad** (opcional, ver `tournament-formats-plan.md`): nivel mínimo/máximo, género, categoría.
4. **Confirmación**: el admin aprueba, o aprobación automática hasta completar cupo; lo que excede va a lista de espera y se promueve al liberarse un lugar.
5. **Pago** (fase posterior): campo `paymentStatus` (`PENDING`/`PAID`/`WAIVED`) cargado manualmente primero; pasarela (Mercado Pago/Stripe) solo si hay demanda real.
6. **Baja**: el jugador puede retirarse hasta el cierre; después lo gestiona el admin.

## Modelo de datos (borrador)

```prisma
enum RegistrationStatus { PENDING CONFIRMED WAITLIST REJECTED WITHDRAWN }

model TournamentRegistration {
  id            String @id @default(cuid())
  tournamentId  String
  playerId      String
  status        RegistrationStatus @default(PENDING)
  paymentStatus String?
  note          String?
  createdAt     DateTime @default(now())
  decidedAt     DateTime?
  decidedById   String?
  @@unique([tournamentId, playerId])
}
```

`Tournament.players` seguiría siendo la lista de **confirmados** (se sincroniza al pasar a `CONFIRMED`), para no romper sorteo, ranking ni estadísticas.

## Endpoints / UI

- `POST/DELETE /api/tournaments/[id]/registration` (usuario con jugador vinculado, `session.user.playerId`).
- `GET/PATCH /api/admin/tournaments/[id]/registrations` (aprobar, rechazar, promover, marcar pago).
- Botón «Inscribirme» en la ficha pública del torneo y pestaña «Inscripciones» en el modal de preparación.

## Dependencias y notas

- Requiere cuentas vinculadas a jugadores (ya existe `User.player` y la unificación por email).
- Notificaciones de confirmación/lista de espera dependen de `notifications-and-share-images-plan.md`.
- Auditoría: `REGISTRATION_CREATE/CONFIRM/WITHDRAW` con actor.
- Privacidad: no exponer mail/teléfono de otros inscriptos.
- Debe cerrarse (o congelarse) al confirmar el sorteo oficial (`../finalizados/official-draw-bracket-plan.md`).

## Preguntas para cuando se retome

- ¿Hay cobro de inscripción? ¿Con qué medio?
- ¿Se permite inscribir a invitados sin cuenta?
- ¿La lista de espera promueve automáticamente?
