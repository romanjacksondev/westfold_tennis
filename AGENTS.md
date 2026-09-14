<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Reglas del Proyecto

## Gestión de Planes de Trabajo
- **Creación de planes**: Cada vez que se cree un plan de implementación, registrarlo como archivo Markdown dentro de la carpeta `docs/` (por ejemplo: `docs/<nombre-del-plan>.md`).
- **Implementación de planes**: Cuando el plan se implemente y verifique con éxito, mover el archivo a la carpeta `docs/finished/` (por ejemplo: `docs/finished/<nombre-del-plan>.md`) y actualizar su estado a **Implementado**.
