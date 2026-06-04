# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Stack

- **Next.js 16.2.7** — App Router only, no Pages Router
- **React 19.2** with Server Components by default
- **Tailwind CSS v4** (`@tailwindcss/postcss` via `postcss.config.mjs`)
- **TypeScript 5**, ESLint 9 flat config

## Commands

```bash
npm run dev       # start dev server (Turbopack, outputs to .next/dev)
npm run build     # production build (Turbopack by default)
npm run start     # start production server
npm run lint      # ESLint directly (NOT next lint — removed in v16)
```

No test runner is configured yet.

## Next.js 16 Breaking Changes

Always read `node_modules/next/dist/docs/` before writing code that touches these areas.

### Async Request APIs (fully breaking)

`cookies()`, `headers()`, `draftMode()`, `params`, and `searchParams` are now async-only. Synchronous access is removed.

```tsx
// CORRECT in Next.js 16
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
}
```

Run `npx next typegen` to generate `PageProps`, `LayoutProps`, `RouteContext` type helpers.

### `middleware` → `proxy`

Rename `middleware.ts` → `proxy.ts`. Export function must be named `proxy`, not `middleware`. Edge runtime is NOT supported in `proxy` — use Node.js only.

### Linting

`next lint` is removed. Use `eslint` directly. `next build` no longer runs linting.

### Caching APIs

- `revalidateTag` now requires a second `cacheLife` profile argument: `revalidateTag('tag', 'max')`
- `unstable_cacheLife` / `unstable_cacheTag` → use `cacheLife` / `cacheTag` (stable, no prefix)
- New: `updateTag` (Server Actions only) for immediate cache refresh
- New: `refresh()` from `next/cache` to refresh client router from a Server Action
- PPR replaced by `cacheComponents: true` in `next.config.ts`

### Other removals

- `serverRuntimeConfig` / `publicRuntimeConfig` removed — use `process.env` + `NEXT_PUBLIC_` prefix
- `next/legacy/image` removed — use `next/image`
- `images.domains` deprecated — use `images.remotePatterns`
- Parallel route slots require explicit `default.js` (build fails without it)
- AMP support fully removed
- `devIndicators.appIsrStatus`, `buildActivity`, `buildActivityPosition` removed

### Turbopack

Default for both `next dev` and `next build`. Dev output goes to `.next/dev` (not `.next`). Turbopack config moves from `experimental.turbopack` to top-level `turbopack` in `next.config.ts`. Webpack config will break the build — use `--webpack` flag to opt out if needed.

### React 19.2 features available

View Transitions, `useEffectEvent`, `Activity` component. React Compiler support is stable (opt-in via `reactCompiler: true` in config, requires `babel-plugin-react-compiler`).
