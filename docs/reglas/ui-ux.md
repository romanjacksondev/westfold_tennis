# Reglas de UI / UX

1. **Componentes del mismo tipo se comportan igual.** Los selectores y listas desplegables (`.type-selector`, `select` de `.field`, filtros) comparten el mismo estado de foco: borde y contorno en el color de acento (`#e7795b`). No debe haber un componente que resalte y otro que no. Si se cambia uno, cambiar todos.
2. **Nada de diálogos del navegador.** Prohibido `window.confirm` / `alert` / `prompt`. Para confirmaciones usar `useConfirm()` de `src/components/ui/ConfirmDialog.tsx`, que muestra un modal con el estilo de la app.
3. **Mensajes de confirmación cortos y directos**, sin repetir información que ya se ve en pantalla. Ejemplo: «¿Finalizar torneo?» + «Después solo se podrá corregir indicando un motivo…».
4. **No permitir elegir más jugadores que el tamaño del cuadro** (`drawSize`): los botones/checkboxes se deshabilitan al llegar al tope y se explica el motivo («El cuadro está completo»). Evitar acciones posibles pero confusas.
5. **Tarjetas de una misma grilla con la misma altura** (`.players-grid`, nombre con altura mínima de 2 líneas y estadísticas ancladas abajo).
6. **Una acción por intención.** No ofrecer botones que hagan casi lo mismo. Ejemplo: solo «Generar de nuevo» para el sorteo (sin «Re-sortear»), e «Iniciar torneo» confirma el cuadro.
7. **Un solo editor para crear y corregir un resultado**, precargado al corregir; en torneos terminados el motivo es obligatorio.
8. **Lo asignable una sola vez no vuelve a pedirse.** El selector de nivel de un torneo terminado solo aparece si no tiene nivel asignado.
9. **El trofeo del campeón va antes del nombre**, no debajo.
10. **Pantallas públicas nunca en blanco.** Un torneo sin partidos igual muestra sus datos (nombre, estado, jugadores) y un estado vacío claro.
11. **Filtros ordenados**: barra con campos etiquetados, botón «Limpiar filtros» con contador de filtros activos.
12. **Hooks de ruta en layouts** (`usePathname`, etc.) van dentro de `Suspense` (Next 16 con `cacheComponents`).
