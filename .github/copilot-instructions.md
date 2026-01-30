# Copilot Instructions for Schedy Scheduler

## Project Overview

Schedy Scheduler is a React + TypeScript + Vite frontend for a scheduling application built with Supabase backend. It manages stores, employees, customers, and scheduling through a responsive UI with Portuguese localization.

## Architecture Patterns

### Core Stack

- **React 19** with TypeScript for type-safe components
- **Vite** for fast development/builds (`npm run dev`, `npm run build`)
- **Tailwind CSS 4** + **Radix UI** for unstyled, accessible component primitives
- **Supabase** (PostgreSQL) for real-time data, auth, and storage
- **React Router 7** for client-side routing
- **React Hook Form** + **Yup** for form validation
- **TanStack React Table** for data tables
- **dayjs** for date handling

### Project Structure

```
src/
  pages/         # Route components (scheduler.tsx is main view)
  components/    # Reusable UI elements
    form/        # Form-specific components (Input, Select, TimePicker, MultiSelect)
    ui/          # Radix UI wrapper components (Button, Card, Dialog, Table, etc)
  hooks/         # Custom React hooks (useToast)
  context/       # React Context providers (ToastContext)
  lib/           # Utilities and Supabase client
  configs/       # Configuration (dayjs-config.ts)
```

## Key Patterns & Conventions

### Authentication & Protected Routes

- `useAuth()` hook loads user session and associated store data from Supabase
- `ProtectedRoute` component wraps pages requiring authentication
- Auth state is fetched on app mount and monitored via `authService.onAuthStateChange()`
- User type extends Supabase `User` with custom `name` and `store` properties

### Form Handling

- Form components wrapped under `src/components/form/` (Input, Select, TimePicker, MultiSelect, Switch)
- Use with React Hook Form's `register()` for controlled inputs
- Yup schemas for validation (see modal/form submissions)
- Custom form component pattern: wraps Radix UI primitives with form-specific logic

### Toast/Alert Notifications

- Global `ToastContext` provider at root (`main.tsx`)
- `useToast()` hook provides `addToast(message, type?, duration?)` method
- Types: `success`, `error`, `info`, `warning` with color-coded styling
- Auto-dismisses after `duration` (default 3000ms), or indefinite if duration=0

### UI Component Composition

- Radix UI primitives in `src/components/ui/` (Dialog, Sheet, Select, etc)
- Wrapper pattern adds Tailwind classes and sensible defaults
- `cn()` utility (from clsx + tailwind-merge) for conditional classNames
- Modal component uses Dialog primitive with configurable footer buttons

### Database & Types

- Supabase types auto-generated to `src/lib/database.types.ts`
- Main tables: `stores`, `employees`, `customers`, `services`, `appointments`, `availability`
- Type safety via TypeScript `Database` type imported from database.types
- Services directory contains API/service layer (referenced in useAuth but empty)

### Styling Approach

- Tailwind CSS 4 as utility-first framework
- Responsive breakpoints: mobile-first with `md:` prefix for medium+ screens
- Custom colors/animations loaded via `@tailwindcss/vite` plugin
- Layout: flexbox/grid for responsive design (e.g., sidebar toggles on mobile)

### Internationalization

- Portuguese language strings hardcoded throughout (e.g., "Carregando...", "Domingo", "Cancelar")
- Day names in `STORE_WEEK_DAYS` constant use Portuguese labels
- No i18n library; translations are inline

## Development Workflow

### Commands

- `npm run dev` - Start Vite dev server with HMR
- `npm run build` - Type-check (tsc -b) then build to dist/
- `npm run lint` - Run ESLint on codebase
- `npm run preview` - Preview production build locally

### Adding Features

1. Create page component in `src/pages/` and route in `routes.tsx`
2. Use `ProtectedRoute` if auth required
3. Build forms with `src/components/form/` utilities + React Hook Form
4. Use `useToast()` for feedback
5. Access database via Supabase client in `src/lib/supabase.ts`
6. Create service modules in `src/services/` for data layer (currently empty)

### Import Alias

- `@` points to `src/` directory (configured in vite.config.ts)
- Import pattern: `import { Component } from "@/components/Button"`

## Critical Integration Points

### Supabase Client

- Initialized in `src/lib/supabase.ts` with URL and anon key
- Imported as `import { supabase } from "@/lib/supabase"`
- Typed with `Database` type from database.types.ts
- Used in auth/store services for all data operations

### App Initialization

- Root provider stack: `ToastProvider` → `BrowserRouter` → `Routes` + `ToastContainer`

## Common Gotchas

- Toast hook requires `ToastProvider` in parent tree
- Form components expect React Hook Form `register()` output
- Database types are generated; regenerate after schema changes
- Portuguese UI strings need manual translation if adding i18n later
