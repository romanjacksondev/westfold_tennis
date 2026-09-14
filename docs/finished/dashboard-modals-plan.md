# Plan: Modales para Nuevo Registro y Edición en el Dashboard

Estado: **Implementado**.

## Contexto

En el dashboard administrativo (`/dashboard`), el formulario de creación/edición de registros se encontraba embebido originalmente como una columna fija (`form-panel`) al lado del listado (`list-panel`). El objetivo de este cambio fue que en **todas las opciones** (Torneos, Partidos, Perfiles deportivos, Sedes, Superficies, Tipos, Categorías, Usuarios), la creación de un nuevo registro y la edición se realicen a través de un **modal emergente**, liberando la vista principal para que el listado ocupe el ancho completo.

## Decisiones de Diseño

1. **Botón de acción rápida**: En la cabecera de la lista de registros se agrega un botón con la etiqueta contextual de cada sección (`+ Nuevo Torneo`, `+ Nuevo Partido`, `+ Nuevo Jugador`, etc.) que abre el modal en modo creación (`editing = null`).
2. **Edición**: Al hacer clic en "Editar" en cualquier fila del listado:
   - Para torneos en preparación (`PREPARATION`), se abre el modal especializado `TournamentPreparationModal`.
   - Para todos los demás casos y recursos, se precargan los datos del registro y se abre el modal en modo edición (`editing = item`).
3. **Manejo de errores**: Si la validación falla o la API devuelve un error, el mensaje se visualiza dentro del modal para no perder los datos ingresados por el usuario.
4. **Cierre accesible**: Se permite cerrar el modal con "Cancelar", el botón "✕", haciendo clic en el backdrop o presionando la tecla `Escape`.

## Componentes y Archivos Modificados

### 1. `src/components/features/admin/DashboardConsole.tsx`
- Se agregó el mapeo `resourceInfo` con nombres singulares, plurales y textos de botón para cada recurso.
- Se agregaron los estados `isFormModalOpen` y `modalError`.
- Se implementaron las funciones `openCreateModal()`, `closeFormModal()` y el listener para la tecla `Escape`.
- Se reestructuró la sección `list-panel` para ocupar todo el espacio horizontal.
- Se encapsuló el formulario dentro de `<div className="type-modal-backdrop">` y `<section className="type-modal record-modal">`.

### 2. `src/app/globals.css`
- Se actualizó `.admin-grid` a `grid-template-columns: 1fr`.
- Se agregaron estilos para `.record-modal`, `.admin-create-button`, `.modal-actions` y `.type-modal-backdrop.nested-modal` (`z-index: 120`).

