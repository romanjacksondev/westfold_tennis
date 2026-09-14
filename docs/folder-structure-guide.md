# Westfold Project Folder and File Usage Guide

This document defines how the folders and files in this Next.js project should be organized and used. The goal is to keep the codebase predictable, scalable, and easy to navigate.

## Project Structure

```text
my-nextjs-app/
├── public/                   # Static assets (images, favicons, fonts, icons)
├── src/                      # Main application source wrapper
│   ├── app/                  # Next.js App Router (all routing files live here)
│   │   ├── layout.tsx        # Global layout wrapper
│   │   ├── page.tsx          # Homepage (/)
│   │   ├── globals.css       # Global styles
│   │   ├── (auth)/           # Route group: omitted from URL path
│   │   │   └── login/
│   │   │       └── page.tsx  # Resolves to /login
│   │   ├── dashboard/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx  # Resolves to /dashboard/123
│   │   │   └── page.tsx      # Resolves to /dashboard
│   ├── components/           # Shared UI components
│   │   ├── ui/               # Primitive / reusable UI building blocks
│   │   └── features/         # Domain-aware components with logic
│   ├── hooks/                # Custom reusable React hooks
│   ├── lib/                  # Core app configuration, utilities, and backend integration
│   │   ├── actions/          # Server actions organized by domain
│   │   ├── utils.ts          # Helper functions
│   │   └── ...               # Prisma, API clients, auth config, etc.
│   ├── types/                # Global TypeScript definitions
│   └── ...                   # Additional source folders as needed
├── next.config.mjs           # Next.js settings
├── package.json              # Scripts and dependencies
├── tsconfig.json             # TypeScript config
└── README.md                 # Project overview and setup
```

---

## Core Folders

### src/app/
This folder is the heart of the routing system in Next.js. Any folder inside `src/app/` is treated as a route by default unless it is specifically excluded via route groups or special conventions.

Rules:
- Keep route files focused on routing and page composition.
- Use `layout.tsx`, `page.tsx`, and route folders to define application structure.
- Avoid putting large business logic or heavy data-fetching code directly in route files.
- Prefer delegating logic to components, hooks, or `lib/` modules.

Good examples:
- `src/app/page.tsx` for homepage composition
- `src/app/dashboard/page.tsx` for dashboard entry point
- `src/app/(auth)/login/page.tsx` for grouped auth routes

Avoid:
- Long data-fetching logic in `page.tsx`
- Network calls mixed directly into UI components when they belong in `lib/`
- Unstructured ad-hoc helpers placed at the route level

---

### public/
This folder contains static assets served directly by the browser.

Examples:
- images
- favicons
- fonts
- icons

A file like `public/logo.png` can be referenced in code as `/logo.png`.

Rules:
- Store only static, browser-served assets here.
- Do not place source code files or dynamic generated files here.
- Keep filenames consistent and descriptive.

---

### src/components/
This folder holds reusable UI elements used across the app.

Recommended structure:
- `components/ui/` for low-level reusable primitives such as Button, Input, Card, Modal
- `components/features/` for components tied to domain logic or specific user workflows such as LoginForm, TournamentCard, MatchSummary

Rules:
- Keep components focused and reusable.
- Split presentational UI from domain-specific workflows.
- Large feature components should be broken into smaller reusable pieces.
- Avoid putting business rules inside generic `ui/` components.

---

### src/hooks/
This folder contains reusable custom React hooks.

Use it for:
- stateful logic shared across components
- browser APIs wrappers
- data-access abstractions that are reused
- logic that would otherwise clutter UI components

Rules:
- Keep hooks focused on a single responsibility.
- Return stable, predictable values.
- Name hooks clearly using the `useX` convention.

---

### src/lib/
This folder acts as the application’s core backend and utility layer.

Use it for:
- Prisma / database clients
- external service integrations
- auth configuration
- API helpers
- shared utility functions
- server actions organized by domain under `lib/actions/`

Rules:
- Treat this as the central logic layer.
- Keep business logic here instead of inside route files.
- Avoid importing from `app/` into `lib/`.
- Use single-direction dependency flow: `app -> components -> lib`

Recommended dependency rule:
- `app/` can import from `components/` and `lib/`
- `components/` can import from `lib/`
- `lib/` should not import from `app/` or `components/` in a way that creates circular logic

This creates a clean architecture where routes orchestrate, components render, and `lib/` handles logic and integrations.

---

## Architectural Rules

### 1. One-way dependency flow
Keep dependencies moving inward:

```text
app -> components -> lib
```

This means:
- Route files should orchestrate screens and compose components.
- Components should render UI and delegate logic to hooks or `lib/` functions.
- Core application logic should live in `lib/` and not depend on route-specific code.

---

### 2. Colocation for small local logic
If a component or utility is only used by one page or route, it can be colocated near that route using a private folder such as:

```text
src/app/dashboard/_components/
```

Use this for:
- route-specific UI helpers
- local widgets used only once
- temporary logic that is not shared across the app

Move code to the global `src/components/` folder only when it is reused across multiple features or pages.

---

### 3. Keep route files clean
Files such as `page.tsx` should act as lightweight orchestrators, not large containers full of logic.

Prefer:
- route file imports a feature component
- feature component handles main UI
- shared logic is pulled into hooks or `lib/`

This keeps route files readable and easier to maintain.

---

### 4. Type safety and shared contracts
Use `src/types/` for shared TypeScript types and interfaces that are used across multiple parts of the app.

Rules:
- Keep cross-feature types in the global type folder.
- Use route-specific types close to the route when they are only used there.
- Avoid duplicating equivalent types across files.

---

## Practical Pattern

A well-structured page should look like this:

```tsx
import { DashboardOverview } from '@/components/features/dashboard/DashboardOverview';
import { getDashboardData } from '@/lib/actions/dashboard';

export default async function DashboardPage() {
  const data = await getDashboardData();

  return <DashboardOverview data={data} />;
}
```

This pattern keeps:
- the route file focused on orchestration
- feature components focused on rendering
- logic in `lib/actions/` or `lib/`

---

## Final Principles

1. Route files are for routing and composition.
2. Components are for UI and feature rendering.
3. Hooks handle reusable stateful logic.
4. `lib/` holds application logic, services, and integrations.
5. Keep dependencies flowing inward and avoid architectural drift.
6. Colocate only when local; centralize when shared.

Following these rules keeps the project organized, scalable, and easier for the whole team to maintain.
