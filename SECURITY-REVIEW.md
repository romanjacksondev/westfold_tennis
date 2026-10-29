# Revisión de seguridad de dependencias

**Fecha:** 2026-10-29  
**Alcance:** dependencias npm del repositorio correcto.

## Resultado

La auditoría inicial informó 3 avisos altos, 2 moderados y 5 bajos. Después de actualizar las dependencias compatibles, no quedan avisos críticos, altos ni moderados. `npm audit` informa 4 entradas de severidad baja, todas en la cadena de Flowbite.

| Severidad | Hallazgo | Estado |
|---|---|---|
| Alta | `deepmerge-ts` anterior a 8 es vulnerable a agotamiento de pila al combinar grafos recursivos; llegaba por `flowbite-react`. | Corregido con un override a `deepmerge-ts` 8.0.2 o superior dentro de la rama 8. |
| Baja | La cadena `flowbite` → `flowbite-datepicker` → `@rollup/plugin-node-resolve` incluye `deepmerge`, con un aviso de prototype pollution. | Pendiente: no hay una corrección compatible disponible en la versión actual de Flowbite 4. npm propone bajar Flowbite a 2.3.0, lo que supondría un downgrade mayor incompatible con la integración actual de Tailwind 4. |

## Actualizaciones

- Actualizados React y React DOM a 19.3.1, `dotenv` a 18.0.9 y `@types/node` a 26.6.6.
- Actualizadas las dependencias permitidas por los rangos existentes con `npm update`.
- Añadidos `@eslint/js`, `typescript-eslint` y `eslint-plugin-react`, importados por la configuración ESLint pero ausentes como dependencias directas.
- Se probó TanStack Table 9; su API incompatible rompió el build, por lo que se mantuvo la última versión compatible de la rama 8 (8.21.3).
- ESLint 10 y TypeScript 7 no se actualizaron porque los plugins actuales no los soportan; `typescript-eslint` requiere TypeScript menor que 6.1.

## Verificación

- `npm audit`: 0 avisos críticos, altos o moderados; 4 bajos.
- `npm run build`: correcto. Se aplazaron las rutas API con acceso a base de datos hasta la petición, evitando consultas durante el prerender de build.
- Servidor de producción: `GET /` respondió HTTP 200.
- El lint de los cinco handlers modificados pasa. Una ejecución completa de ESLint aún informa 47 errores preexistentes en otros archivos; no hay un script de lint definido en `package.json`.

El repositorio ignora `package-lock.json`; por tanto, el archivo de dependencias versionado es `package.json` y npm resolverá las versiones transitivas al instalar.
