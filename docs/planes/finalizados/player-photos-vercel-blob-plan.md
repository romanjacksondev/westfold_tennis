# Plan: fotos de jugadores en Vercel Blob

**Estado:** Implementado

## Contexto
- Hoy los avatares son archivos estáticos en `public/img/avatar/{apodo}.jpeg` (solo 4 jugadores) y la ruta se arma a mano desde el apodo en tres lugares:
  - `src/app/players/[id]/page.tsx` (`avatarPath`, normaliza: sin espacios y en minúsculas)
  - `src/components/features/players/components/Players.template.tsx` (normaliza solo el primer espacio)
  - `src/components/features/leaderboard/components/Leaderboard.template.tsx` (**no normaliza**, por eso "El Comandante" da 404)
- No se pueden agregar fotos sin hacer un deploy, y depender del apodo es frágil (cambiar el apodo rompe la foto).
- Objetivo: guardar la foto de cada jugador en **Vercel Blob** y guardar su URL en la BD.

## Decisiones propuestas
- **Servicio:** Vercel Blob (`@vercel/blob` >= 2.3), store **privado** (`westfold-tennis-blob`, región iad1). Las URLs del Blob no son accesibles desde internet: solo el backend las lee (SDK con OIDC en Vercel, `BLOB_READ_WRITE_TOKEN` en local). Las fotos se sirven por una ruta propia sin login, así el ranking público las muestra sin exponer el almacenamiento.
- **Subida:** *server upload* a través de una API route de admin. Evita exponer el token y permite validar. Límite de 4,5 MB por request en Vercel, por lo que se **redimensiona y comprime en el cliente** antes de subir (objetivo ≤ 150 KB, 512×512 máx) y se genera además una **miniatura de 128×128 (~15-30 KB)** para ranking y listas.
- **BD:** nuevos campos `Player.photoUrl String?` (foto 512×512) y `Player.photoThumbUrl String?` (miniatura 128×128). Ambos opcionales y guardan el **pathname** del blob (p. ej. `players/{id}-{rand}.jpg`), no una URL pública.
- **Entrega:** ruta pública `GET /api/players/[id]/photo?size=thumb|full` que lee el blob privado con `get()` del SDK y responde con `Content-Type`, `ETag` y `Cache-Control: public, max-age=..., stale-while-revalidate` para que navegador y CDN la cacheen y no se consuman operaciones/transferencia de Blob en cada vista. Como el pathname cambia en cada subida (sufijo aleatorio), la URL de la ruta lleva `?v={hash}` para invalidar caché. Si no hay foto responde 404 y la UI muestra iniciales.
- **Plan gratuito (Hobby):** alcanza para ~1000 jugadores (1 GB de almacenamiento, 2.000 operaciones de subida, 10 GB de transferencia). Si se excede no se cobra, pero Blob deja de funcionar 30 días y se ven las iniciales de fallback.
- **Fallback:** si no hay `photoUrl`, se mantienen las iniciales (ya implementado en el ranking).

## Pasos

### 1. Configuración de Vercel (manual, fuera del código)
1. En el proyecto de Vercel: Storage → Create → Blob → acceso **Private**, marcando "Add a read-write token env var to this connection". Variables creadas: `BLOB_STORE_ID`, `BLOB_WEBHOOK_PUBLIC_KEY` y `BLOB_READ_WRITE_TOKEN` (solo Production y Preview).
2. Para desarrollo local, copiar `BLOB_READ_WRITE_TOKEN` y `BLOB_STORE_ID` a `.env` (no se commitea; `.env*` ya está en `.gitignore`). Documentar las variables en el README.

### 2. Dependencias y config
- `npm i @vercel/blob`.
- `next.config.ts`: no hace falta `remotePatterns`; las imágenes salen del mismo origen (`/api/players/[id]/photo`). Se usa `<img>` plano.

### 3. Base de datos
- `prisma/schema.prisma`: `photoUrl String?` y `photoThumbUrl String?` en `Player`.
- Migración `npx prisma migrate dev --name add_player_photo_url` + `prisma generate`. Backup previo de la BD (`docker exec docker-db-1 pg_dump ...`).
- No hay backfill obligatorio. Para los 4 jugadores con foto local hay dos opciones: (a) dejar el fallback a la ruta estática vieja un tiempo, o (b) subirlas a Blob con un script único (`scripts/migrate-avatars.ts`) y guardar las URLs. Se recomienda (b), y luego borrar `public/img/avatar/`.

### 4. API
- Nuevo `src/app/api/admin/players/[id]/photo/route.ts`:
  - `POST` (multipart): `requireAdmin()`, recibe `photo` y `thumb`, valida tipo (`image/jpeg|png|webp`) y tamaño (foto ≤ 300 KB, miniatura ≤ 60 KB), sube ambas con `put('players/{id}.jpg', ..., { access: 'private', addRandomSuffix: true })`, guarda los pathnames en `photoUrl` y `photoThumbUrl` y borra con `del()` las anteriores (borrar es gratis).
  - `DELETE`: borra ambos blobs y deja los dos campos en `null`.
  - Se mantiene `await connection()` (Cache Components).
- **Decidido:** un jugador con usuario vinculado puede cambiar o quitar **su propia** foto. Permiso: admin, o `session.user.playerId === id`. Cualquier otro caso devuelve 403. El perfil `/players/[id]` muestra el control de foto solo al dueño o al admin.
- `src/app/api/admin/[resource]/route.ts` y `[id]/route.ts`: ignorar `photoUrl` en el cuerpo genérico para que solo se cambie por la ruta de fotos.
- `src/app/api/players/[id]/photo/route.ts` agrupa `GET` (público, ver "Entrega"), `POST` y `DELETE` (sesión: admin o dueño). `src/proxy.ts` deja pasar solo el `GET` sin login.
- `src/app/api/leaderboard/route.tsx`: devolver `id` y un `photoVersion` (derivado del pathname) en vez de `nickname`.

### 5. Frontend
- **Helper único** `src/utils/player-photo.ts`: `getPlayerPhoto(player, 'thumb' | 'full')` devuelve `/api/players/{id}/photo?size=...&v=...` (miniatura para ranking, listas y tarjetas; grande para perfil) o `null` si no hay foto. Reemplaza las tres rutas armadas a mano y corrige el 404 del ranking.
- Actualizar `Leaderboard.template.tsx`, `Players.template.tsx`, `players/[id]/page.tsx`, `Card.template.tsx` (props `imageUrl`) y los tipos en `src/types/index.tsx` y `features/players/types/Players.tsx`.
- **Admin** (`DashboardConsole.tsx`, formulario de jugadores): campo "Foto" con vista previa, botones "Subir/Cambiar" y "Quitar". Recorte cuadrado y reducción con `canvas` antes de subir, generando foto y miniatura (sin dependencias extra).
- Mantener el fallback a iniciales.

### 6. Seed
- `prisma/seed.ts` no cambia: `photoUrl` queda `null` (iniciales). Opcional: si existe `BLOB_READ_WRITE_TOKEN`, no hace nada con fotos para no depender de la red.

### 7. Limpieza
- Tras migrar las 4 fotos: eliminar `public/img/avatar/` y las rutas `/img/avatar/...` del código.

## Archivos a tocar
`package.json`, `prisma/schema.prisma` + migración, `next.config.ts` (si `next/image`), `src/app/api/admin/players/[id]/photo/route.ts` (nuevo), `src/app/api/admin/[resource]/{route,[id]/route}.ts`, `src/app/api/leaderboard/route.tsx`, `src/utils/player-photo.ts` (nuevo), `Leaderboard.template.tsx`, `Players.template.tsx`, `players/[id]/page.tsx`, `Card.template.tsx`, `DashboardConsole.tsx`, tipos, `scripts/migrate-avatars.ts` (temporal), README.

## Validación
- `npm run typecheck`, `npm run build`, ESLint en archivos tocados.
- Probar con `curl`/navegador: subir, reemplazar (el blob viejo se borra) y quitar una foto; rechazo de archivos > 2 MB o de tipo inválido; acceso sin sesión admin → 401/403.
- Verificar visualmente ranking, lista de jugadores y perfil con y sin foto.

## Capacidad estimada (Hobby, 1000 jugadores)
- Almacenamiento: 1000 × (≈150 KB + ≈25 KB) ≈ 175 MB de 1 GB.
- Subidas: ~1000 altas + cambios, por debajo de las 2.000 operaciones incluidas (con dos archivos por foto contar ≈ 2 operaciones por alta: ~2.000, **justo en el límite**; si se llega, subir en lotes a lo largo de varios meses o pasar a Pro).
- Transferencia: ranking de 12 jugadores con miniaturas ≈ 0,3 MB por visita → decenas de miles de visitas al mes dentro de los 10 GB.
- Evitar navegar el store desde el panel de Vercel: cada interacción cuenta como operación.
- El cupo de CDN de Hobby se comparte con todo el proyecto. Si el club cobra o monetiza la app, Hobby no aplica (uso no comercial) y hay que pasar a Pro.

## Riesgos
- Límite de 4,5 MB por request en funciones de Vercel (mitigado con redimensionado en cliente y límites de 300 KB / 60 KB en servidor).
- La ruta `/api/players/[id]/photo` es pública (necesaria para el ranking sin login): quien conozca el id de un jugador puede ver su foto. Lo que se evita es el acceso directo al Blob, el listado y el hotlinking. Conviene tener consentimiento de los jugadores (se menciona privacidad en `/privacy`).
- Cada lectura de un blob privado cuenta como operación simple (10.000 incluidas); se mitiga con caché HTTP/CDN en la ruta.
- Si `BLOB_READ_WRITE_TOKEN`/OIDC no está disponible, la ruta responde 404 y la UI muestra iniciales.
- Si no se define `BLOB_READ_WRITE_TOKEN` en un entorno, la subida falla; la API debe devolver un error claro y el resto de la app seguir funcionando.

## Decisiones tomadas
1. **Edición:** los jugadores pueden cambiar su propia foto (además del admin).
2. **Fotos actuales:** se migran a Blob con `scripts/migrate-avatars.ts` (sube foto y miniatura de elcomandante, fettel, rofer y topspin, y guarda las URLs). Luego se borra `public/img/avatar/`.
3. **Store privado + ruta propia:** el Blob no es accesible desde internet; el backend sirve las fotos sin login para que el ranking las muestre. Avisar a los jugadores de que su foto aparece allí.

## Requisitos previos (manuales)
- Crear el Blob store **privado** en Vercel (con la opción de token de lectura/escritura) y copiar `BLOB_READ_WRITE_TOKEN` y `BLOB_STORE_ID` a `.env`. Sin ellos no se puede subir ni migrar en local. **Esperar a que el store esté creado antes de implementar.**

## Implementación (resumen)
- Migración `20261030140000_add_player_photo_paths` (aplicada con `migrate deploy`; hay drift previo en el historial, no resetear).
- `src/utils/player-photo.ts`, `src/components/ui/PlayerPhoto/{PlayerPhoto,PlayerPhotoEditor}.tsx` (recorte/compresión con canvas, subida, quitar), integrado en el perfil (dueño o admin) y en el modal de edición de jugadores del admin.
- Las 4 fotos se migraron al Blob privado y `public/img/avatar/` y el script temporal se eliminaron.
- En producción hay que ejecutar la migración y subir las fotos de los jugadores reales desde el perfil/admin (la BD de producción no tiene las fotos migradas).
