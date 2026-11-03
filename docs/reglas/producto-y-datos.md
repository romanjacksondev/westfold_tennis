# Reglas de producto y datos

1. **Todo dato mostrado debe ser real y calculado.** Nada ficticio ni de relleno. Cada cifra sale de partidos/sets/games guardados.
2. **Las cifras deben ser consistentes entre sí.** Partidos jugados = ganados + perdidos; los porcentajes se calculan sobre esos totales. Los totales históricos se calculan sobre **todo** el historial; solo las listas «recientes» se limitan.
3. **Estadísticas de jugador en tarjetas:** partidos jugados con % ganados y % perdidos, y sets jugados con % ganados y % perdidos.
4. **El campeón se calcula, no se edita a mano.** Sale del cuadro (final o 1º de la tabla) y se guarda en `championId`.
5. **Round robin:** la tabla de posiciones se actualiza a medida que se cargan partidos y, con todos cargados, muestra el campeón.
6. **Los resultados solo se cargan con el torneo en curso**, no en la preparación.
7. **El sorteo se genera antes de iniciar y se confirma al iniciar.** Participantes, formato y clasificados quedan bloqueados cuando hay sorteo.
8. **Corregir un resultado**: permitido, incluidos los sets; en torneos terminados exige motivo y queda en auditoría (`TOURNAMENT_CORRECTION`). Se bloquea si el partido siguiente ya se jugó.
9. **W.O.** es un resultado válido (`Match.walkover`) con ganador y sin sets.
10. **Borrado lógico** (`deletedAt`): los datos eliminados no cuentan en estadísticas ni listados.
11. **Toda acción administrativa relevante se audita** (`AuditLog`, con before/after).
