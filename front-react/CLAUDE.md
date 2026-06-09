# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Commands

```bash
pnpm dev          # start dev server (Vite)
pnpm build        # tsc type-check then Vite production build
pnpm lint         # ESLint across all source files
pnpm preview      # serve the production build locally
```

There are no test scripts configured.

---

## Architecture

### Boot sequence

`src/main.tsx` → `src/app.tsx`

`app.tsx` calls two synchronous hydration functions before rendering:
- `hydrateAuthCookie()` — hits `GET auth/me` and sets Zustand auth status to `"signIn"` or `"signOut"` (currently the API call is commented out, so it always resolves to `"signOut"`)
- `hydrateLanguage()` — restores the persisted `lang` key from localStorage

While auth status is `"idle"`, `<LoadingPage>` is displayed. Once resolved, `<AppRoutes>` renders either `<AdminRoutes>` or `<AuthRoutes>` depending on auth status.

### Provider stack

```
<APIProvider>          — react-query v3 QueryClient
  <ThemeProvider>      — dark/light via React Context + localStorage
    <AppWrapper>       — global wrapper (AppWrapper from components)
      <AppRoutes>      — BrowserRouter, decides Admin vs Auth
```

### Layout

`AppLayout` wraps all authenticated pages:

```
<SidebarProvider>
  <AppSidebar />   — collapsible, 290 px expanded / 90 px icon-only
  <Backdrop />     — mobile overlay
  <AppHeader />    — sticky top bar (search, theme toggle, notifications, user)
  <Outlet />       — page content, max-width 2xl, p-4 md:p-6
```

### State management

| Store | Location | Persisted |
|---|---|---|
| Auth (status, user) | `src/core/cookies/index.tsx` — Zustand | cookie via API |
| Language | `src/core/lang/index.tsx` — Zustand | `localStorage["lang"]` |
| Sidebar state | `src/context/SidebarContext.tsx` — React Context | no |
| Theme | `src/context/ThemeContext.tsx` — React Context | `localStorage["theme"]` |

### API layer

`src/api/client.tsx` creates an Axios instance pointed at `import.meta.env.VITE_API`.  
Authentication is cookie-based. A `createAuthRefreshInterceptor` intercepts 401 responses and calls `POST auth/refresh`; on failure it signs the user out.

Data fetching in components uses **react-query v3** (`useQuery`, `useMutation`) via `APIProvider`.

### Routing

Routes are defined in `src/enums/routes.tsx` as the `E_ROUTES` enum. Add new routes there first, then register them in the appropriate route file:
- `src/routes/components/adminRoutes/index.tsx` — authenticated pages under `<AppLayout>`
- `src/routes/components/authRoutes/index.tsx` — public pages (SignIn, PasswordReset, 404)

### i18n

i18next with HTTP backend. Translation files live in `public/locales/{en,fr,ar}/translation.json`. Default language is `fr`. Language direction (`dir`) is set on `<html>` at runtime in `src/routes/index.tsx`; Arabic activates RTL and adds the `rtl` class to `<body>`.

`i18n.ts` has `debug: true` — turn this off before production.

### Theming

Dark mode uses a CSS class strategy: `ThemeProvider` adds/removes the `dark` class on `<html>`. Tailwind v4 declares `@custom-variant dark (&:is(.dark *))` in `src/index.css`.

**Brand color** is gray-orange `#76695e` (brand-500). The full 12-stop scale (`brand-25` → `brand-950`) is defined in the `@theme` block in `src/index.css`. All brand tokens use the `--color-brand-*` CSS variables.

**Logos** — always use the pair:
- Light mode: `/images/logo/light-logo.png`
- Dark mode: `/images/logo/dark-logo.png`

Swap with Tailwind: `className="dark:hidden"` / `className="hidden dark:block"`.

### TypeScript path aliases

`tsconfig.app.json` sets `"baseUrl": "src"`, so all folders under `src/` are importable as bare names:

```ts
import { useTheme } from "context";
import { AppLayout } from "layouts";
import { Home } from "pages";
import { client } from "api";
import { useAuthCookie } from "core";
```

Each directory exposes a barrel `index.ts` / `index.tsx`.

### SVGs

`vite-plugin-svgr` is configured. Import SVGs as React components using the named export:

```ts
import { ReactComponent as MyIcon } from "./icon.svg";
```

---

## Key conventions

- **Named exports** for all components and hooks; default export only in `src/app.tsx` and page-level `index.tsx` files where the router imports them.
- **Barrel files** — every `src/` subdirectory has an `index.ts` that re-exports its public surface. Add new exports there.
- **Form validation** — use `react-hook-form` with `@hookform/resolvers` and either `zod` (v4) or `yup` schemas.
- **Utility classes** — custom Tailwind utilities (`menu-item`, `menu-item-active`, etc.) are declared via `@utility` in `src/index.css`; prefer those over raw class strings for nav items.
- **`clsx` + `tailwind-merge`** — use together when conditionally composing class names.

---

## Important technical decisions

- **Auth hydration is currently a stub.** In `src/core/cookies/index.tsx`, the `GET auth/me` call is commented out. The hydrate function immediately calls `signOut()`, meaning the app always starts on the auth pages. Re-enable the call when the backend is ready.
- **Tailwind v4** — configuration lives entirely in `src/index.css` using `@theme`, `@utility`, and `@custom-variant`. There is no `tailwind.config.js`.
- **react-query v3** (not v4/TanStack Query v5) — the API differs; do not use v5 patterns.
- **React Router v7** — uses `react-router` (not `react-router-dom`); use `<Link>` and `useNavigate` from `"react-router"`.
- **`VITE_API`** environment variable must be set for any API call to work. Create a `.env.local` file with `VITE_API=http://your-backend/api/`.
