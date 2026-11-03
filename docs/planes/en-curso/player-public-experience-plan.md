# Plan (para revisar): Experiencia del jugador y del público

Estado: **Pendiente de revisión**. Muy interesante: es lo que más ven los socios.

## Situación actual

- Páginas: inicio, ranking (públicas), jugadores, torneos, `/tournaments/[id]`, `/draws`, estadísticas, H2H, historial. Casi todo requiere sesión (`src/proxy.ts` solo deja públicas `/`, `/leaderboard`, `/information`, `/privacy`, `/terms` y APIs de home/leaderboard/foto).
- Perfil de jugador con estadísticas y nivel (`/players/[id]`).
- No hay una vista «en vivo» de un torneo ni «mis partidos».

## Propuestas

1. **Página pública del torneo** (`/tournaments/[id]` sin login): cuadro/tabla con resultados, próximos partidos, campeón. Link y **código QR** para colgar en el club. Datos personales (mail, teléfono) nunca se exponen. Requiere decidir qué torneos son públicos (`Tournament.isPublic`, default `true` al publicar el sorteo).
2. **«Mi torneo» / «Mis partidos»**: para el usuario con jugador vinculado, su próximo rival, partidos jugados y pendientes, posición en la tabla. Sale de `session.user.playerId`.
3. **Modo TV** (`/tournaments/[id]/tv`): pantalla completa con rotación automática (cuadro, resultados recientes, ranking), refresco cada 30–60 s, alto contraste y sin interacción.
4. **Perfil enriquecido**: racha actual, superficie favorita (ya hay efectividad por superficie), rivalidades (H2H destacados), títulos y evolución de ranking (depende de `ranking-points-plan.md`).
5. **Compartir**: botones para compartir resultado, cuadro y perfil como imagen o link con vista previa (Open Graph) según `notifications-and-share-images-plan.md`.
6. **Móvil primero**: auditar las pantallas clave en 360–414 px (cuadro con scroll/zoom, tablas, formulario de resultado). Considerar PWA instalable (manifest + service worker mínimo).
7. **Accesibilidad e idioma**: contraste, foco visible, textos es-AR consistentes, etiquetas ARIA en tablas y cuadros.
8. **Buscador global** (jugador, torneo) en la barra de navegación.

## Requisitos técnicos

- Revisar `src/proxy.ts` para ampliar rutas públicas con lista explícita y mantener APIs privadas protegidas.
- Con `cacheComponents` activo en `next.config.ts`, definir qué se cachea (ranking/cuadros finalizados) y qué es dinámico (torneos en curso; usar `connection()` como en las rutas actuales). Leer la guía de caché en `node_modules/next/dist/docs/` antes de implementar.
- Respuestas públicas con campos mínimos (nombre, apodo, nivel, foto, resultados).
- Performance: paginar historiales y evitar N+1 en consultas del perfil.

## Privacidad

- Foto y nombre completo visibles en público: agregar preferencia del jugador (`showPublicly`) y reflejarlo en `src/app/privacy/page.tsx`.
- Menores de edad: definir política (apodo/iniciales) antes de abrir páginas públicas.

## Fases sugeridas

1. Torneo público + QR (la mayor ganancia con poco esfuerzo, depende del sorteo oficial).
2. «Mis partidos» y perfil enriquecido.
3. Modo TV.
4. PWA, accesibilidad y buscador.

## Para decidir al revisar

- ¿Todo el torneo es público o solo el cuadro y los resultados?
- ¿Se permite que los jugadores oculten su foto o nombre completo?
- ¿Hay una pantalla física en el club para el modo TV?
