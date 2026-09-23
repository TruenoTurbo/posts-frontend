# posts-frontend

A small React + Vite frontend for browsing scraped posts and an image gallery.

Features
- List, search and filter posts with pagination
- Gallery view (photo wall) with on-demand image fetching
- Theme system with multiple color themes and dark mode
- Built with React + TypeScript + Tailwind CSS + Vite

Quick setup

Prerequisites
- Node.js 18+ recommended
- A backend API (Go) running at `http://localhost:8090` (or set `VITE_API_URL`)

Install and run (development)

```bash
npm install
npm run dev
```

Build and preview

```bash
npm run build
npm run preview
```

Available scripts (from package.json)
- `dev` — start Vite dev server (default port configured to 3010)
- `build` — run TypeScript typecheck and build with Vite
- `preview` — preview production build
- `lint` — run ESLint for `src` (ts/tsx)
- `typecheck` — run `tsc --noEmit`

Environment
- API base URL can be set via `VITE_API_URL`; default is `http://localhost:8090/api/v1`.
- Vite dev server is configured to run on port `3010` and proxies `/api` to `http://localhost:8090`.

Project structure (important files)
- [index.html](index.html) — Vite entry HTML
- [src/main.tsx](src/main.tsx) — app entry
- [src/App.tsx](src/App.tsx) — main app layout and view switching (posts / gallery)
- [src/api/client.ts](src/api/client.ts) — central API client (fetches posts, images, filters)
- [src/hooks/usePosts.ts](src/hooks/usePosts.ts) — data fetching and pagination logic used by the UI
- [src/contexts/ThemeContext.tsx](src/contexts/ThemeContext.tsx) — theme provider and persistence
- [src/components] — UI components (Header, Search, Posts, Gallery, UI primitives)
- [src/types](src/types) — TypeScript types for posts, gallery and API shapes
- [public/themes.css](public/themes.css) — CSS variables and theme palettes
- [tailwind.config.js](tailwind.config.js) & [postcss.config.js](postcss.config.js) — Tailwind setup
- [vite.config.ts](vite.config.ts) — Vite config (aliases, proxy, port)

Notes & implementation details
- Pagination: backend expects offset/limit; the frontend calculates offset from page number.
- Images: `ApiClient.fetchPostImages` normalizes JSON or raw binary responses into data URLs when needed.
- Search & filters: `usePosts` debounces requests (300ms) and resets page on filter changes.
- Theme: supports `data-theme` attributes and CSS variables; Tailwind `darkMode` is configured.

Development tips
- If the app shows "Failed to load posts", ensure the Go backend is running and reachable at `http://localhost:8090`.
- To change API host in development without altering code, set `VITE_API_URL` in an env file (e.g., `.env.local`).

License & authors
- No license file included. Add a `LICENSE` if you intend to open-source this project.

Contact / Next steps
- If you want, I can:
  - add a short CONTRIBUTING.md or PR checklist
  - add example `.env.local` and `.env.production` templates
  - add CI scripts for typecheck + lint

