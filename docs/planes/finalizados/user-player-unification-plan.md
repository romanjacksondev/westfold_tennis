# Plan de Unificación: Jugadores y Usuarios (Westfold Tennis)

Estado: **Implementado**.

## Contexto

En Westfold Tennis conviven dos conceptos centrales relacionados con la identidad de las personas en el circuito:
- **`Player`**: Perfil deportivo del jugador de tenis. Almacena estadísticas de competencia, partidos disputados, games, sets, torneos ganados, nickname y participaciones.
- **`User`**: Cuenta de autenticación y acceso al sistema. Almacena credenciales (`email`, `password` con hash bcrypt), rol de permisos (`USER` o `ADMIN`) y estado de activación (`isActive`).

## Decisión de Arquitectura: Relación 1-a-1 Desacoplada

Se resolvió **mantener y consolidar la relación 1-a-1 desacoplada** entre `Player` y `User` mediante la clave foránea única:
- `Player.userId String? @unique`
- `Player.user User? @relation(fields: [userId], references: [id], onDelete: SetNull)`
- `User.player Player?`

### Justificación:
1. **Flexibilidad en el circuito amateur**: Permite que un administrador cree y gestione jugadores para organizar torneos y cargar resultados sin requerir obligatoriamente que cada jugador posea cuenta o email de login registrado en la plataforma.
2. **Integridad del historial deportivo**: Al archivar o desactivar una cuenta de usuario (`User`), el perfil de `Player` y todo su historial de partidos, torneos ganados y estadísticas acumuladas permanece intacto (`onDelete: SetNull`).

---

## Componentes Implementados

### 1. Autenticación y Sesión NextAuth
- **Tipos (`src/types/next-auth.d.ts`)**:
  - Se extendieron las interfaces `Session['user']` y `JWT` para incluir `playerId?: string | null` y `playerNickname?: string | null`.
- **Configuración (`src/lib/auth.ts`)**:
  - En la función `authorize`, se incluye la relación `player: { select: { id: true, name: true, nickname: true } }`.
  - El nombre a mostrar se prioriza con el perfil del jugador (`Nombre "Apodo"`), y se propagan `playerId` y `playerNickname` en los callbacks de JWT y sesión.

### 2. Endpoints Administrativos (`src/app/api/admin/`)
- **Consulta (`GET /api/admin/[resource]`)**:
  - Al consultar `players`, se incluye la relación `user: { select: { id: true, email: true, role: true, isActive: true } }`.
  - Al consultar `users`, se incluye la relación `player: { select: { id: true, name: true, lastname: true, nickname: true } }`.
- **Creación (`POST /api/admin/[resource]`)**:
  - En `players`, se admite `userId` opcional, validando que el usuario no esté ya vinculado a otro jugador.
  - En `users`, se valida que el `playerId` seleccionado no pertenezca ya a otro usuario.
- **Actualización (`PATCH /api/admin/[resource]/[id]`)**:
  - Admite vinculación y desvinculación limpia en ambas direcciones:
    - Si se envía `playerId: ""` o `null` en usuario, desconecta la relación (`disconnect: true`).
    - Si se envía `userId: ""` o `null` en jugador, desconecta la relación (`disconnect: true`).
  - Previene vincular registros ya asignados a otra entidad.
- **Auto-unificación masiva (`POST /api/admin/unify-users-players`)**:
  - Nuevo endpoint que encuentra todos los jugadores sin usuario asignado y usuarios sin jugador cuyo `mail` / `email` coincidan (ignorando mayúsculas y espacios).
  - Los vincula de forma segura dentro de una transacción Prisma.

### 3. Consola Administrativa (`src/components/features/admin/DashboardConsole.tsx`)
- **Gestión bidireccional**:
  - En el formulario de Jugador se agregó el campo `userId` ("Cuenta de usuario").
  - En el formulario de Usuario se mantiene `playerId` ("Perfil de jugador").
  - En ambos selectores se indica si un registro ya está ocupado por otra persona para evitar errores.
- **Visibilidad en listados**:
  - En "Usuarios", cada fila muestra el jugador vinculado (`👤 Nombre`) o la indicación `⚪ Sin jugador vinculado`.
  - En "Perfiles deportivos", cada fila muestra la cuenta de acceso (`🔑 email`) o `⚪ Sin cuenta vinculada`.
- **Botón de acción rápida**:
  - Botón `"⚡ Auto-vincular por email"` en el panel de registros de Usuarios y Jugadores con confirmación y feedback de cantidad de vínculos realizados.

### 4. Navegación y Vistas de Usuario
- **Barra lateral (`Sidebar.template.tsx`)**:
  - Para usuarios autenticados que tienen un jugador vinculado (`session.user.playerId`), se agrega dinámicamente el acceso directo `"Mi Perfil"` apuntando a `/players/${playerId}`.
- **Barra de navegación (`NavBar.template.tsx`)**:
  - Muestra una pastilla con el nombre o apodo del jugador vinculado junto al botón de "Salir".
- **Página de perfil deportivo (`src/app/players/[id]/page.tsx`)**:
  - Identifica si el usuario logueado es el dueño del perfil (`session.user.playerId === id`) mostrando la insignia destacada `"Tu perfil"`.

### 5. Datos Iniciales (`prisma/seed.ts`)
- Se vinculan por defecto los usuarios de prueba iniciales con los perfiles de jugadores semilla correspondientes.

