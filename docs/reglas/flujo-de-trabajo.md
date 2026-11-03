# Reglas de flujo de trabajo

1. **Planes:** cada plan nace en `docs/planes/en-curso/<nombre>.md` y, al implementarse y verificarse, se mueve a `docs/planes/finalizados/` con estado **Implementado**. Actualizar el índice `docs/planes/roadmap-club-tournaments.md`.
2. **No ejecutar tests e2e** (`npm run test:e2e`) salvo que se pidan explícitamente. Para validar usar `npx tsc --noEmit` y `npm run test:integration`.
3. **No hacer commits** salvo pedido explícito.
4. **Idioma:** respuestas al usuario y documentación en español.
5. **Después de correr tests o builds**, restaurar `next-env.d.ts` con `git checkout next-env.d.ts`.
6. **Tras cambios de esquema Prisma**, reiniciar `next dev` (el cliente queda desactualizado).
7. **Next.js 16:** leer la guía en `node_modules/next/dist/docs/` antes de escribir código específico de Next (ver `AGENTS.md`).
8. **Documentar cambios de comportamiento** en `docs/arquitectura/` (ej. ciclo de vida del torneo) y nuevas reglas en `docs/reglas/`.
