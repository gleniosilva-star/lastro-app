# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Lastro** ("Sua vida financeira em paz") is a mobile-first personal finance PWA in Brazilian Portuguese. All user-facing copy, currency (BRL via `Intl.NumberFormat("pt-BR")`), and dates are pt-BR. LGPD (Brazilian GDPR) compliance is a product theme — see the data export in `src/pages/Profile.tsx`.

Stack: React 19 + TypeScript + Vite 8, with Supabase for auth and database. Several dependencies are installed but not yet wired in (`@tanstack/react-query`, `react-hook-form`, `zod`, `recharts`, `date-fns`, `sonner`, `lucide-react`).

## Commands

```bash
npm run dev      # Vite dev server
npm run build    # tsc -b (typecheck) then vite build
npm run lint     # eslint over the repo
npm run preview  # serve the production build
```

There is no test framework configured. `npm run build` is the only correctness gate (it runs the TypeScript compiler).

## Environment

Requires `.env.local` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (consumed in `src/lib/supabase.ts`). The committed `.env.local` is a placeholder; real values are not in the repo. The Supabase client uses a custom `storageKey: 'lastro-auth'`.

## Architecture

**Routing is manual, not a router.** `src/App.tsx` holds a `tab` string in state and switches on it (`dashboard | transactions | accounts | goals | profile`). Adding a screen means: create `src/pages/<Name>.tsx`, add a `case` in `App.tsx`'s `renderTab()`, and add an entry to both nav components.

**Two layouts, one breakpoint.** `App.tsx` tracks `isDesktop` (`window.innerWidth >= 768`) via a resize listener. Desktop renders `src/components/Sidebar.tsx` (fixed 240px left rail); mobile renders the inline `BottomNav`. Both call the same `setTab`. Keep both nav lists in sync when adding tabs.

**Auth gate.** `App.tsx` subscribes to `supabase.auth.onAuthStateChange`. No session → render `<Auth />`; otherwise render the tabbed shell. The Supabase `user` object is passed as a prop into every page (`{ user }: { user: any }`).

**Data access is direct Supabase calls inside `useEffect`.** Each page owns its own `loading`/data `useState` and queries `supabase.from(...)` on mount (commonly several tables in parallel via `Promise.all`). There is no shared data layer, cache, or React Query usage yet — mutations re-call a local `load()` to refresh. Row-level security is assumed server-side; inserts set `user_id: user.id` explicitly.

### Database tables (inferred from queries)

- `accounts` — has `current_balance`, `is_archived` (queries filter `is_archived = false`).
- `transactions` — `amount` (always positive), `type` (`"receita"` income / `"despesa"` expense), `description`, `transaction_date`, `account_id`, `category_id` (nullable), `user_id`. Often joined: `categories(name, icon, color)`, `accounts(name)`.
- `categories` — `name`, `icon` (emoji), `color`, `type` (matches transaction `type` for filtering).
- `goals` — `name`, `current_amount`, `target_amount`.

The `receita`/`despesa` string convention drives sign, color, and category filtering throughout; preserve it.

## Conventions

- **Styling is 100% inline `style={{}}` objects.** No CSS framework, no CSS modules. Each file redeclares a local `COLORS` palette constant (navy `#0A2540`, emerald `#10B981`, destructive `#E11D48`, etc.) — copy it when adding a page.
- **Currency/format helpers** (`fmt`, date formatters) are redefined per-file rather than shared. Match the existing pattern in the file you edit.
- Components are default-exported functions. Props are loosely typed (`user: any`, data arrays as `any[]`).
- Modals are conditionally-rendered fixed overlays (see the "Nova transação" sheet in `Transactions.tsx`), not a library.
