# Ciclo de Vida y Estados de un Torneo (Westfold Tennis)

Este documento describe la especificación funcional y técnica del ciclo de vida de los torneos en **Westfold Tennis**, estableciendo las transiciones, permisos y reglas de negocio para cada uno de sus 4 estados posibles.

---

## 1. Resumen de Estados

| Estado | Clave Enum | Descripción | Acciones Permitidas | Impacto en Puntos |
| :--- | :--- | :--- | :--- | :--- |
| **En preparación** | `PREPARATION` | Torneo recién creado o en fase de armado previo al inicio. | Modificar formato, sede, superficie, tamaño de cuadro, clasificados, categoría, nombre y gestionar libremente los jugadores participantes. | No otorga puntos (aún no se disputa). |
| **En curso** | `IN_PROGRESS` | Competencia activa con sorteo oficial confirmado (`drawStatus = CONFIRMED`). | Cargar resultados de los partidos pendientes del cuadro, corregir un resultado (con motivo) y cerrar el torneo. No se permite alterar participantes ni formato. | No otorga puntos hasta completarse. |
| **Terminado** | `FINISHED` | Torneo cerrado con la acción `finish` tras completarse todos los partidos del cuadro. | El campeón se **calcula** desde el cuadro y se guarda en `championId` (caché). Registro de `finishedAt`. Solo se admiten correcciones de resultado con motivo y auditoría. | **Otorga puntos oficiales** para el Leaderboard/Ranking según la categoría. |
| **Cancelado** | `CANCELLED` | Torneo suspendido o cancelado administrativamente. | Puede cancelarse desde cualquier estado. Se puede reactivar. | **0 puntos** otorgados para el ranking. Los partidos disputados **sí cuentan** para el Head-to-Head (H2H) y estadísticas de jugadores. |

---

## 2. Detalle de Cada Estado

### Estado 1: EN PREPARACIÓN (`PREPARATION`)
* **Momento de activación**: Se asigna automáticamente al momento de crear cualquier torneo nuevo (`status = PREPARATION`).
* **Objetivo**: Permitir al administrador configurar todos los aspectos deportivos y logísticos antes de dar inicio a la competencia.
* **Operaciones habilitadas**:
  - **Jugadores participantes**: Agregar o quitar jugadores confirmados (`players`). Se puede consultar en tiempo real el cupo ocupado respecto al tamaño del cuadro (`drawSize`).
  - **Formato del torneo**: Definir y cambiar el tipo de torneo (`Playoffs`, `Round Robin`, `Round Robin + Playoffs`).
  - **Tamaño del cuadro**: Configurar el `drawSize` (ej. 4, 8, 16, 32).
  - **Clasificados**: Configurar la cantidad de clasificados a playoffs (`qualifiers`) si el tipo es `Round Robin + Playoffs`.
  - **Configuración logística**: Modificar el nombre del torneo, la fecha programada, la sede deportiva (`venueId`), el tipo de superficie (`surfaceId`) y la categoría de puntos (`tournamentCategoryId`).
* **Sorteo oficial**: con los participantes guardados, el admin genera el sorteo (siembra `NONE`/`RANKING`/`LEVEL`/`MANUAL`), puede re-sortear o intercambiar jugadores mientras es **borrador** (`DRAFT`) y lo **confirma** (`CONFIRMED`). Con un sorteo en borrador o confirmado no se pueden cambiar participantes, formato ni clasificados (409): hay que descartarlo primero.
* **Restricciones**: No se pueden jugar ni cargar partidos oficiales mientras el torneo esté en preparación.

---

### Estado 2: EN CURSO (`IN_PROGRESS`)
* **Momento de activación**: Cuando el administrador confirma que el torneo está listo para iniciar (`action: 'start'`).
* **Requisitos para la transición**:
  1. Todos los parámetros de configuración obligatorios deben estar elegidos:
     - Nombre del torneo
     - Sede (`venueId`)
     - Superficie (`surfaceId`)
     - Categoría (`tournamentCategoryId`)
     - Formato / Tipo de torneo (`tournamentTypeId`)
     - Tamaño del cuadro (`drawSize` $\ge 2$)
  2. Cuadro y participantes listos:
     - Se debe contar con al menos 2 jugadores confirmados.
     - La cantidad de jugadores confirmados no puede exceder el `drawSize`.
     - El sorteo debe estar **confirmado** (`drawStatus = CONFIRMED`); si no, `start` responde 400.
* **Operaciones habilitadas**:
  - Carga de resultados **solo sobre un casillero pendiente del cuadro** (`drawMatchId` obligatorio en `POST /api/add-match`, solo admin). No existen partidos fuera del cuadro; los amistosos quedan para más adelante.
  - El ganador avanza solo al siguiente casillero; en `Round Robin + Playoffs` los clasificados salen de la tabla. Ante un empate se define el orden manual (`set-group-order`).
  - Corregir el ganador de un casillero (`PATCH /api/admin/matches/:id` con `reason`); falla con 409 si el partido siguiente ya se jugó.
  - Consulta en tiempo real del avance del bracket o tabla de posiciones de round robin.
* **Restricciones**: Queda bloqueada la modificación del formato, superficie, categoría y la adición/eliminación de jugadores para preservar la integridad del cuadro.

---

### Estado 3: TERMINADO (`FINISHED`)
* **Momento de activación**: Cuando se han jugado todos los partidos correspondientes al cuadro (la final en eliminación directa o todas las rondas en round robin) y se corona al ganador del torneo.
* **Requisitos para la transición**:
  1. Todos los casilleros del cuadro deben tener resultado (acción `finish`, sin empate pendiente en la tabla).
  2. El **campeón** se calcula (ganador de la final; en Round Robin, 1º de la tabla) y se guarda en `championId`. No se edita a mano.
  3. Se registra automáticamente la fecha de finalización (`finishedAt = new Date()`).
* **Correcciones posteriores**: un admin puede corregir un resultado con motivo obligatorio; el campeón se recalcula, la UI advierte el cambio y se audita `TOURNAMENT_CORRECTION` (con `championChanged`).
* **Impacto en el sistema**:
  - El torneo pasa a computar formalmente para el **Leaderboard / Ranking anual y de los últimos 12 meses**.
  - Otorga los puntos correspondientes a la categoría (`TournamentCategoryPoints`) al campeón y finalistas según la escala configurada.
  - El título ganado incrementa el contador de torneos y campeonatos del jugador en su perfil público.

---

### Estado 4: CANCELADO (`CANCELLED`)
* **Momento de activación**: Puede ser cancelado en cualquier momento mediante la acción `Cancelar` en la consola de administración.
* **Reglas de Puntos vs Estadísticas H2H**:
  - **Puntos de Ranking**: **NO otorga puntos**. Los torneos con estado `CANCELLED` son expresamente ignorados en el cálculo del Leaderboard (`/api/leaderboard`).
  - **Historial H2H y Rendimiento Individual**: Si durante el torneo se alcanzaron a disputar partidos (completos o parciales), **estos partidos sí se conservan** y se contabilizan para:
    - El historial de enfrentamientos directos entre jugadores (`Head-to-Head` / H2H).
    - El balance total de victorias y derrotas de los jugadores.
    - La efectividad por superficie y estadísticas de sets/games.
* **Reactivación**: El administrador puede revertir la cancelación mediante la acción `Reactivar`, retornando al estado que corresponda (`PREPARATION`, `IN_PROGRESS` o `FINISHED`).

---

## 3. Diagrama de Transición de Estados

```mermaid
stateDiagram-v2
    [*] --> PREPARATION: Crear torneo (Nuevo Torneo)

    state PREPARATION {
        [*] --> Configurar
        Configurar: Modificar nombre, fecha, sede, superficie, categoría
        Configurar --> AsignarJugadores: Agregar / quitar jugadores
        AsignarJugadores --> Configurar: Ajustar formato y tamaño de cuadro
    }

    PREPARATION --> IN_PROGRESS: Iniciar torneo (Todo configurado + sorteo confirmado)
    
    state IN_PROGRESS {
        [*] --> DisputarPartidos
        DisputarPartidos: Cargar resultados, sets y games
    }

    IN_PROGRESS --> FINISHED: Cerrar torneo (campeón calculado)
    
    PREPARATION --> CANCELLED: Cancelar torneo
    IN_PROGRESS --> CANCELLED: Cancelar torneo
    FINISHED --> CANCELLED: Cancelar torneo
    
    CANCELLED --> PREPARATION: Reactivar (si no tenía partidos)
    CANCELLED --> IN_PROGRESS: Reactivar (si tenía partidos en disputa)
    CANCELLED --> FINISHED: Reactivar (si tenía campeón previo)
```

---

## 4. Matriz de Permisos de Edición

> [!IMPORTANT]
> **Congelamiento de Torneos Terminados**: Una vez `FINISHED`, el torneo **no puede editarse** (datos generales, formato, participantes). La única excepción es la corrección de resultados con motivo y auditoría, que recalcula el campeón.

| Campo / Operación | PREPARATION | IN_PROGRESS | FINISHED | CANCELLED |
| :--- | :---: | :---: | :---: | :---: |
| Nombre del torneo | ✅ Sí | ⚠️ Solo admin | ❌ Bloqueado | ❌ No |
| Fecha | ✅ Sí | ⚠️ Solo admin | ❌ Bloqueado | ❌ No |
| Sede y Superficie | ✅ Sí | ❌ Bloqueado | ❌ Bloqueado | ❌ No |
| Categoría de puntos | ✅ Sí | ❌ Bloqueado | ❌ Bloqueado | ❌ No |
| Formato (`TournamentType`) | ✅ Sí | ❌ Bloqueado | ❌ Bloqueado | ❌ No |
| Tamaño de cuadro (`drawSize`) | ✅ Sí | ❌ Bloqueado | ❌ Bloqueado | ❌ No |
| Agregar / Quitar Jugadores | ✅ Sí (Gestor ágil) | ❌ Bloqueado | ❌ Bloqueado | ❌ No |
| Cargar Partidos y Sets (casillero del cuadro) | ❌ No | ✅ Sí | ❌ Bloqueado | ❌ No |
| Corregir un resultado (con motivo) | ❌ No | ✅ Sí | ⚠️ Sí, recalcula campeón y audita | ❌ No |
| Campeón | ❌ No | ❌ Se calcula al cerrar | ❌ Calculado (se recalcula al corregir) | ❌ No |
| Botón "Editar" en Dashboard | ✅ Abre Modal | ✅ Formulario | ❌ Oculto / Bloqueado | ❌ No |
| Otorga Puntos de Ranking | ❌ No | ❌ No | ✅ Sí | ❌ No |
| Computa para Historial H2H | N/A | ✅ Sí | ✅ Sí | ✅ Sí |

