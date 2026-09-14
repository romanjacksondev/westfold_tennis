# Plan: Corrección de Errores de TypeScript para Deploy en Vercel

Estado: **Implementado**.

## Contexto

Durante la compilación de producción en Vercel (`next build`), el verificador de tipos de TypeScript reportó 24 errores que impiden el despliegue exitoso. Estos errores se dividen en 5 categorías:

1. **Iterador de Map (`src/app/api/players/[id]/stats/route.ts`)**:
   - `TS2802`: `Type 'MapIterator<...>' can only be iterated through when using '--downlevelIteration' flag or target 'es2015' or higher`.
   - `tsconfig.json` tiene `target: "es5"`.

2. **Componente legado sin usar (`src/components/features/leaderboard/components/PointsBreakdown.tsx`)**:
   - Importa componentes que ya no existen en el proyecto (`components/BaseTable/BaseTable`, `components/ModalNewData`).
   - Parámetros implícitos `any`.
   - No es importado por ningún archivo en toda la aplicación.

3. **Parámetro implícito `any` (`src/components/features/players/components/Players.tsx`)**:
   - `TS7006`: `Parameter 'stat' implicitly has an 'any' type` en el mapeo de estadísticas.

4. **Acciones y hooks legados con parámetros implícitos `any` (`src/hooks/actions/*.ts`)**:
   - `matches.ts`, `matchHistory.ts`, `playerStats.ts`, `players.ts`, `surfaces.ts`, `tournaments.ts`, `user.ts`, `venues.ts` tienen firmas de función sin tipar.

5. **Tipado de NextAuth User (`src/lib/auth.ts` y `src/types/next-auth.d.ts`)**:
   - `TS2339`: `Property 'role' does not exist on type 'User | AdapterUser'`.

---

## Cambios Propuestos

### 1. Configuración de TypeScript (`tsconfig.json`) y Stats API (`src/app/api/players/[id]/stats/route.ts`)
- Actualizar `target` en `tsconfig.json` de `"es5"` a `"es2020"` (estándar para Next.js 14+ / 16 en Node 20+).
- En `src/app/api/players/[id]/stats/route.ts`, usar `Array.from(surfaces.values())` y `Array.from(opponents.values())`.

### 2. Limpieza de Componente Huérfano
- Eliminar `src/components/features/leaderboard/components/PointsBreakdown.tsx`.

### 3. Tipado en `Players.tsx`
- Tipar el parámetro `stat` en `src/components/features/players/components/Players.tsx`.

### 4. Tipado en `src/hooks/actions/`
- Asignar tipos explícitos a los parámetros de las funciones en `src/hooks/actions/*.ts` para satisfacer `noImplicitAny`.

### 5. Tipado en NextAuth
- Declarar la extensión de la interfaz `User` en `src/types/next-auth.d.ts`.
- Asegurar el casteo seguro en `src/lib/auth.ts`.

---

## Plan de Verificación
- Ejecutar `npx tsc --noEmit` y asegurar 0 errores de TypeScript.
- Una vez verificado, mover este plan a `docs/finished/fix-build-typescript-errors.md` y marcar como **Implementado**.

