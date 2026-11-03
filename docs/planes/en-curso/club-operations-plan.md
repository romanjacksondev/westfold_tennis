# Plan (para revisar): Operación y administración del club

Estado: **Pendiente de revisión**.

## Situación actual

- Roles: `USER` y `ADMIN` (`UserRole`); el admin puede todo en `/dashboard`.
- Borrado lógico (`deletedAt`) en la mayoría de las entidades; auditoría de cambios disponible (`AuditLog`, pestaña «Auditoría»).
- Los torneos terminados no se editan (excepto el nivel); no hay un camino explícito para corregir un error de resultado.
- Sedes (`Venue`) con nombre, teléfono y dirección; sin canchas.
- Un `backup.sql` manual en el repo.

## Propuestas

1. **Rol de organizador**: `UserRole.ORGANIZER` (o permisos por torneo): puede cargar/corregir resultados, gestionar inscriptos y el sorteo de sus torneos, sin tocar usuarios, niveles ni configuración global. Centralizar la autorización en `src/lib/require-session.ts` (`requireOrganizer(tournamentId)`) y auditar cada acción.
2. **Corrección de resultados con trazabilidad**: acción «Corregir resultado» con motivo obligatorio, reversión del avance del cuadro (ver `../finalizados/official-draw-bracket-plan.md`) y recálculo de puntos; todo en `AuditLog` con before/after.
3. **Reapertura de torneos terminados** (solo admin, con motivo): vuelve a `IN_PROGRESS`, revierte puntos y snapshot; documentar en `docs/arquitectura/ciclo-de-vida-del-torneo.md`.
4. **Sedes y canchas**: entidad `Court` (sede, nombre, superficie, activa). Base necesaria para la futura programación de partidos (fuera de alcance hoy).
5. **Plantillas de torneo**: «Duplicar torneo» con sede, superficie, categoría, tipo, tamaño y nivel; sin jugadores ni fechas.
6. **Importación/exportación**: alta masiva de jugadores por CSV (validación, previsualización, detección de duplicados por mail) y exportación de resultados/ranking en CSV.
7. **Reportes para el dueño**: torneos por mes, participación, jugadores activos/inactivos, partidos jugados, ocupación por sede; ingresos si se incorpora pago.
8. **Gestión de datos y privacidad**: exportar o eliminar los datos de un jugador a pedido (hay contacto en la política de privacidad), con auditoría; retención de `AuditLog` (propuesta: 12 meses, auth 90 días) con script de purga.
9. **Respaldo y recuperación**: documentar backups automáticos del proveedor de Postgres (retención y restauración probada), y un procedimiento de restauración en `docs/`. Sacar `backup.sql` del repo si contiene datos reales.
10. **Salud operativa**: usar `/api/health` con un monitor externo gratuito (uptime) y revisar los logs de Vercel; Sentry/Axiom solo cuando haya uso productivo (ver decisión previa).
11. **Seguridad de cuentas**: límite de intentos de login (aprovechando `LOGIN_FAILURE` ya auditado), restablecer contraseña por mail y 2FA opcional para admins. Parte queda fuera del alcance actual (calidad).

## Fases sugeridas

1. Corrección de resultados + reapertura con auditoría (se apoya en el sorteo oficial).
2. Rol de organizador.
3. Sedes/canchas y plantillas de torneo.
4. Importación/exportación y reportes.
5. Privacidad, retención y backups.

## Riesgos

- Permisos por torneo aumentan la superficie de autorización: cubrir con tests de integración por rol (`USER`, `ORGANIZER`, `ADMIN`).
- Reapertura de torneos afecta rankings: depende del plan de ranking.

## Para decidir al revisar

- ¿Cuántas personas administran hoy? Define si el rol de organizador justifica el esfuerzo.
- ¿Los organizadores son globales o por torneo?
- ¿Qué reportes necesita realmente el dueño?
