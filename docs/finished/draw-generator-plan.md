# Plan: Generador de cuadro (draw) por torneo

Estado: **pendiente de implementación**. Este documento existe para que otro agente pueda continuar el trabajo sin necesitar el historial completo de la conversación previa.

## Contexto

El proyecto `westfold_tennis` es una app Next.js (App Router) + Prisma/PostgreSQL para gestionar un circuito de tenis amateur. Los torneos (`Tournament`) tienen un tipo/formato (`TournamentType`): `Round Robin`, `Round Robin + Playoffs` o `Playoffs`. Actualmente:

- Ya existe un generador de fixture de round robin **legacy** y desconectado del flujo real: función `generateDraw(n, ps)` en `src/utils/utils.ts` (líneas ~254-287), que arma rondas de enfrentamientos por el método de círculo (circle method). Es reutilizable para el fixture de Round Robin.
- Existe una pantalla "Draw Generator" en `src/features/draws/` que usa un patrón legacy (`store/selectors`) y no persiste nada ni está conectada a un torneo real. No usarla como base; es solo referencia de UI.
- **No existe** ningún concepto de "cuadro de eliminación directa" (bracket), ni de "slot" o "vacante", ni persistencia de la estructura del cuadro.
- El modelo `Tournament` en `prisma/schema.prisma` es (verificado, tal cual está hoy):

```prisma
model Tournament {
  id                   String             @id @default(cuid())
  name                 String
  venueId              String
  venue                Venue              @relation(fields: [venueId], references: [id])
  championId           String?
  champion             Player?            @relation("champion", fields: [championId], references: [id])
  date                 DateTime           @default(now())
  createdAt            DateTime           @default(now())
  finishedAt           DateTime?
  status               TournamentStatus   @default(IN_PROGRESS)
  matches              Match[]
  surfaceId            String
  surface              Surface            @relation(fields: [surfaceId], references: [id])
  tournamentCategory   TournamentCategory @relation(fields: [tournamentCategoryId], references: [id])
  tournamentCategoryId String
  tournamentTypeId     String?
  tournamentType       TournamentType?   @relation(fields: [tournamentTypeId], references: [id])
  players              Player[]           @relation("participations")
  deletedAt            DateTime?
}
```

- `Tournament.players` (relación `participations`) ya existe en el esquema, pero **no hay ningún control en la UI del dashboard** (`src/components/admin/DashboardConsole.tsx`) para asignar jugadores a un torneo existente. El `POST` de creación sí acepta `playerIds` (`src/app/api/admin/[resource]/route.ts`), pero el `PATCH` de edición (`src/app/api/admin/[resource]/[id]/route.ts`, sección `resource === 'tournaments'`, líneas ~68-80) **no procesa `playerIds` en absoluto** (confirmado leyendo el archivo). Esto es un gap que hay que cerrar como parte de esta feature.

## Decisiones ya tomadas con el usuario (no volver a preguntar)

1. **Cuándo se arma el cuadro**: el cuadro se genera con placeholders/"vacantes" en el momento de crear el torneo, según el formato elegido. El admin va confirmando jugadores reales en esos cupos progresivamente, sin necesidad de tener a todos los participantes al momento de crear el torneo.
2. **Semillas en Playoffs**: aleatorias. No se pidió ni se debe implementar arrastre manual de posiciones/semillas.
3. **Clasificados en "Round Robin + Playoffs"**: la cantidad de jugadores que avanzan a la fase de playoffs es **configurable por torneo** (no un valor fijo como "los 2 primeros" o "los 4 primeros").
4. **Persistencia del cuadro**: el cuadro es una **vista previa visual únicamente**. No debe crear registros `Match` reales de antemano. Los partidos reales se siguen cargando como hoy, a través del editor de resultado ya existente en `DashboardConsole` (sección "Resultado del partido" al agregar un partido, que ya arma sets/games y llama a `/api/add-match`).

## Plan de implementación

### 1. Esquema (Prisma)

Agregar a `Tournament`:
- `drawSize Int?` — tamaño total del cuadro/grupo (para Playoffs, típicamente potencia de 2: 4/8/16/32; para Round Robin, cualquier número ≥ 3).
- `qualifiers Int?` — solo tiene sentido cuando el tipo de torneo es "Round Robin + Playoffs"; cantidad de jugadores que clasifican a la fase final.

Pasos:
- Editar `prisma/schema.prisma`.
- Crear una migración nueva en `prisma/migrations/<timestamp>_add_tournament_draw_fields/migration.sql` siguiendo el estilo de las migraciones existentes en esa carpeta (columnas nullable, sin `NOT NULL` ya que son opcionales).
- Ejecutar `npx prisma migrate deploy` y `npx prisma generate` en `westfold_tennis`.
- No editar nada dentro de `prisma/generated/` a mano.

### 2. Backend: aceptar los campos nuevos y sincronizar jugadores

- `src/app/api/admin/[resource]/route.ts` (POST, sección `resource === 'tournaments'`): agregar `drawSize` y `qualifiers` como campos escalares simples del payload (mismo tratamiento que `name`/`date`; convertir a número con `Number(...)` si vienen como string desde un input HTML, y permitir `null`/vacío).
- `src/app/api/admin/[resource]/[id]/route.ts` (PATCH, sección `resource === 'tournaments'`):
  - Agregar manejo de `drawSize`/`qualifiers` igual que en el POST.
  - Agregar manejo de `playerIds` (actualmente ausente): si el payload trae `playerIds` (array de ids), sincronizar la relación completa con `players: { set: playerIds.map((id: string) => ({ id })) }` (usar `set`, no `connect`, para que el checklist de la UI pueda tanto agregar como quitar jugadores en una sola operación).

### 3. Dashboard (`src/components/admin/DashboardConsole.tsx`)

- Agregar el campo numérico `drawSize` a los campos de torneo, tanto en alta como en edición.
- Agregar el campo numérico `qualifiers`, visible únicamente cuando el tipo de torneo seleccionado (por nombre, igual que ya se hace para el selector visual de tipo) sea `"Round Robin + Playoffs"`.
- Agregar un control de selección múltiple ("Jugadores confirmados"), visible solo al editar un torneo existente (no en el alta, porque recién ahí tiene sentido ir sumando participantes), que liste los jugadores disponibles (ya se cargan en `options.players`) con checkboxes, marque los que ya están en `tournament.players`, y al guardar envíe `playerIds` en el PATCH.
- Validaciones mínimas sugeridas (solo advertencias, no bloqueantes): si la cantidad de jugadores confirmados supera `drawSize`, avisar; si `qualifiers` > `drawSize`, avisar.

### 4. Utilidad de bracket (`src/utils/utils.ts`)

- Agregar una función nueva, por ejemplo `buildEliminationBracket(slots: Array<{ id: string | null; label: string }>)`, que arme las rondas de un cuadro de eliminación directa de tamaño `slots.length` (debe ser potencia de 2; si no lo es, completar con vacantes hasta la potencia de 2 superior más cercana).
  - Ronda 1: empareja slots en orden (posición i vs posición length-1-i, o el criterio que se prefiera, ya que las semillas son aleatorias — el orden de `slots` ya debe venir aleatorizado desde el endpoint).
  - Rondas siguientes: en vez de jugadores reales, usar placeholders tipo `"Ganador Partido N"` (donde N es el número de partido de la ronda anterior que alimenta esa posición).
  - Los slots vacíos (sin jugador asignado) se muestran como `"Vacante"`.
- Reutilizar la función ya existente `generateDraw(n, ps)` (líneas ~254-287 de `src/utils/utils.ts`) para el fixture de Round Robin; no reimplementar el algoritmo de círculo.

### 5. Endpoint del cuadro

Crear `src/app/api/tournaments/[id]/draw/route.ts` (GET):
- Buscar el torneo por id, incluyendo `tournamentType` (para saber el nombre del formato), `players` (jugadores ya confirmados), `drawSize`, `qualifiers`.
- Armar la lista de slots: jugadores confirmados (en el orden en que Prisma los devuelva) + vacantes (`null`) hasta completar `drawSize`.
- Según `tournamentType.name`:
  - `"Playoffs"`: devolver las rondas del bracket vía `buildEliminationBracket`.
  - `"Round Robin"`: devolver el fixture completo vía `generateDraw`.
  - `"Round Robin + Playoffs"`: devolver el fixture de grupo (vía `generateDraw` sobre los slots) **y además** un bracket de clasificados (vía `buildEliminationBracket`) armado con placeholders genéricos (`"Puesto 1"`, `"Puesto 2"`, ...) de tamaño `qualifiers`, ya que en la v1 no hace falta precalcular standings reales de partidos jugados.
- Si el torneo no tiene `tournamentType` o `drawSize`, devolver una respuesta clara indicando que falta configurar el cuadro (no un error 500).

### 6. UI pública (`src/app/tournaments/[id]/page.tsx`)

- Agregar una sección nueva "Cuadro del torneo" que haga fetch al endpoint del paso 5 y renderice según el formato:
  - Round Robin: lista de fixtures agrupados por ronda (jugador A vs jugador B, o "Vacante" si el slot no tiene jugador).
  - Playoffs: columnas por ronda (una columna = una ronda), cada partido como una caja simple con los dos nombres/placeholders. Mantenerlo simple: **no** implementar líneas conectoras SVG entre rondas en la v1; alcanza con columnas en fila usando CSS flex/grid.
  - Mixto (Round Robin + Playoffs): el fixture de grupo arriba, y el bracket de clasificados debajo con su propio título ("Clasificados a Playoffs").
- Reutilizar el patrón ya existente en ese archivo (fetch en `useEffect`, estados de loading/error, envoltura en `<Suspense>` porque usa `useParams()`).

### 7. Estilos (`src/app/globals.css`)

- Agregar clases acotadas para el cuadro: contenedor de columnas por ronda, caja de partido, texto de "Vacante" en gris/atenuado, título de ronda. Seguir la paleta y tipografía ya usada en el resto del sitio (fondo `#f5f4ef`, verde oscuro `#183b32`, verde acción `#31745d`, coral `#e7795b`).

## Archivos relevantes (rutas completas)

- `/mnt/801EB3CA1EB3B78C/development/westfold_tennis/prisma/schema.prisma`
- `/mnt/801EB3CA1EB3B78C/development/westfold_tennis/prisma/migrations/` (crear carpeta de migración nueva)
- `/mnt/801EB3CA1EB3B78C/development/westfold_tennis/src/utils/utils.ts`
- `/mnt/801EB3CA1EB3B78C/development/westfold_tennis/src/app/api/admin/[resource]/route.ts`
- `/mnt/801EB3CA1EB3B78C/development/westfold_tennis/src/app/api/admin/[resource]/[id]/route.ts`
- `/mnt/801EB3CA1EB3B78C/development/westfold_tennis/src/components/admin/DashboardConsole.tsx`
- `/mnt/801EB3CA1EB3B78C/development/westfold_tennis/src/app/api/tournaments/[id]/draw/route.ts` (nuevo)
- `/mnt/801EB3CA1EB3B78C/development/westfold_tennis/src/app/tournaments/[id]/page.tsx`
- `/mnt/801EB3CA1EB3B78C/development/westfold_tennis/src/app/globals.css`

## Verificación sugerida al terminar

1. `get_errors` sobre cada archivo tocado.
2. `npx prisma migrate deploy` y `npx prisma generate` sin errores.
3. Crear un torneo Playoffs con `drawSize=8` sin jugadores confirmados: el cuadro debe mostrar 8 "Vacante" organizados en 3 rondas (cuartos, semis, final).
4. Confirmar 3-4 jugadores desde el dashboard (checklist nuevo) y volver a ver el cuadro: esos jugadores deben aparecer en sus slots, el resto sigue en "Vacante".
5. Crear un torneo Round Robin con `drawSize=5`: el fixture debe mostrar todas las rondas del método de círculo con vacantes donde falten jugadores.
6. Crear un torneo Round Robin + Playoffs con `drawSize=6` y `qualifiers=4`: debe verse el fixture de grupo y, debajo, un bracket de 4 posiciones con placeholders "Puesto 1".."Puesto 4".
7. Confirmar que no se creó ningún `Match` real solo por generar o ver el cuadro (la tabla de partidos del torneo debe seguir vacía hasta que se cargue un resultado real).

## Fuera de alcance (no implementar en esta iteración)

- Arrastre manual de semillas en Playoffs.
- Cálculo automático de standings reales para prellenar el bracket de clasificados en el formato mixto.
- Líneas conectoras visuales tipo bracket "real" (SVG/canvas) entre rondas.
- Creación anticipada de partidos reales a partir del cuadro.
