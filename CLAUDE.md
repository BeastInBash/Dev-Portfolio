# CLAUDE.md

Guidance for working in this repo. Personal portfolio for **Mohammad Saif**, a **full-stack developer** (1 year experience). The UI/UX clones the look & feel of https://aanandmadhav.com/ — a warm editorial / "engineering-log" portfolio — but with our own content and accent color.

## Commands

Package manager is **bun** (NOT npm/pnpm).

- `bun install` — install deps
- `bun run dev` — dev server (`vite dev`, port 3000, falls back if taken)
- `bun run build` — production build
- `bun run test` — vitest
- `bunx tsc --noEmit` — typecheck (CI-equivalent gate; `noUnusedLocals`/`noUnusedParameters` are on, so dead imports fail)
- `bun run lint` / `bun run format` — eslint / prettier

## Stack

- **TanStack Start** + **TanStack Router** (file-based routes in `src/routes/`, `routeTree.gen.ts` is generated — don't edit it). SSR + client hydration.
- **React 19**, **TypeScript** (strict).
- **Tailwind CSS v4** via `@tailwindcss/vite` (config-less; everything lives in `src/styles.css` with `@import "tailwindcss"` and `@theme`).
- **shadcn/ui** is installed (`src/components/ui/`, `src/lib/utils.ts`, `tw-animate-css`). shadcn oklch tokens live in `:root`/`.dark` in `styles.css` under `@theme inline`.
- **motion** (framer-motion, `import { motion } from "motion/react"`) for all animation.
- **react-markdown** + **remark-gfm** for Markdown rendering (admin editor preview + public blog post body). Prose styling via `@tailwindcss/typography` (loaded with `@plugin "@tailwindcss/typography"` in `styles.css`). Note: inside the dark `prose-pre` code blocks, `[&_pre_code]:text-cream` overrides `prose-code:text-ink` so fenced code is readable.
- **Backend integration**: a separate Express API (`../portfolio-backend`). `src/lib/api.ts` exports `API_BASE` (`import.meta.env.VITE_API_URL`, default `http://localhost:8080/api/v1`) + `apiFetch` (always `credentials: 'include'` so the auth/visitor cookies flow). `src/lib/auth.tsx` provides `AuthProvider`/`useAuth` for the admin login gate.
- Fonts self-hosted via `@fontsource-variable/*`: JetBrains Mono, Inter Tight, Newsreader.
- `lucide-react` for icons.
- Path aliases: `#/*` and `@/*` → `./src/*`.

## Project structure

```
src/
  routes/
    __root.tsx          # html shell + fixed-height flex layout; <main> is the SCROLL CONTAINER (see gotchas)
    index.tsx           # "/" — hero section
    about/index.tsx     # "/about" (placeholder)
    projects/index.tsx  # "/projects" — 01, list style
    experience/index.tsx# "/experience" — 02, scroll-reveal vertical timeline
    blog/index.tsx      # "/blog" — 03, list of REAL published posts (GET /blogs), links to detail
    blog/$slug.tsx      # "/blog/$slug" — public post page: banner, markdown body, views + LikeButton
    contact/            # "/contact"
    admin/
      route.tsx         # "/admin" LAYOUT — AuthProvider + login gate; own sticky top bar (public Navbar suppressed for /admin); Logout button
      index.tsx         # "/admin" — dashboard with LIVE data (GET /analytics/summary + /blogs/admin/list); recent posts have Edit/Delete
      editor/index.tsx  # "/admin/editor" — create OR edit (?edit=<id>) a post; POSTs/PUTs to the API (multipart for banner upload)
  components/
    Navbar.tsx          # sticky top nav + mobile hamburger → slide-in sidebar
    PageHeading.tsx     # shared editorial header (mono eyebrow `NN / LABEL` + display title + intro)
    AdminLogin.tsx      # the /admin login screen (email + password → POST /auth/login)
    LikeButton.tsx      # anonymous like toggle (optimistic; POST/DELETE /blogs/:slug/like)
    ui/button.tsx       # shadcn
  lib/utils.ts          # shadcn cn()
  lib/api.ts            # API_BASE + apiFetch (credentials: 'include')
  lib/auth.tsx          # AuthProvider / useAuth (admin auth via httpOnly cookie)
  styles.css            # Tailwind import, @theme tokens, shadcn tokens, base layer, smooth-scroll rules
public/assets/
  hero.png              # portrait (1241x1268, ~3.3MB)
  favicon.png           # circular 256px crop of hero.png (favicon)
```

Section numbering convention: Projects = `01`, Experience = `02`, Blog = `03` (passed as `index` to `PageHeading`). The admin panel sits outside this public sequence (dashboard eyebrow is `00 / Overview`).

## Design system (apply to ALL UI)

Warm editorial minimalism with an "engineering-log / terminal" meta layer. Heavy whitespace, hairline borders, sections numbered like `01 / NOW`.

**Palette** (Tailwind `@theme` tokens in `styles.css`):
- `--color-cream` `#f3efe8` — page background (`bg-cream`)
- `--color-ink` `#1a1a1a` — primary text (`text-ink`)
- `--color-muted-warm` `#8a8278` — secondary text (`text-muted-warm`)
- `--color-moss` `#98971a` — **primary accent (gruvbox green)**, used sparingly on the public site (`text-moss`/`bg-moss`): one headline word, nav hover underline, typewriter cursor
- `--color-rust` `#d65d0e` — **secondary accent (gruvbox orange)**, `text-rust`/`bg-rust`/`border-rust`. Pairs with moss; used mainly in the **admin panel** (see below). Keep it off the public marketing pages unless asked.
- `--color-line` `#ddd6ca` — hairline borders (`border-line`)
- Note: the hero status dot uses **amber** (`bg-amber-500`) deliberately, distinct from the green accent.
- Accent usage differs by area: the **public site** keeps moss sparse (highlight, not fill); the **admin panel** intentionally runs warmer/more colorful, pairing moss + rust (stat cards, chart bars, status chips, buttons).

**Typography — three roles:**
- Display sans = **Inter Tight** (`font-display`) — huge tight bold headings.
- Serif = **Newsreader** (`font-serif`) — card/article titles (editorial substance).
- Mono = **JetBrains Mono** (`font-mono`) — ALL meta: eyebrows, section numbers, tags, timestamps, labels. Uppercase + letter-spaced.

**Motion conventions:** staggered fade-up reveals (container `staggerChildren` + a `rise` variant, ease `[0.22,1,0.36,1]`); subtle hover micro-interactions (arrow translate, underline grow); tasteful and slow, not bouncy. Keep ripple/loop animations seamless (fade fully before reset).

## What's built so far

- **Layout shell** (`routes/__root.tsx`): fixed-height flex column — `<body>` is `h-screen overflow-hidden`, a `flex h-screen flex-col` wraps `<Navbar/>` + `<main>`, and **`<main>` is the scroll container** (`flex-1 overflow-y-auto overflow-x-hidden`). `overflow-x-hidden` clips the per-route slide-in animation (`AnimatedOutlet` re-keys on pathname, slides `x:100%→0`). Also fires the **visit beacon** (`POST /analytics/visit`) once per browser session (`sessionStorage` guard), skipping `/admin` so editing doesn't inflate counts.
- **Navbar** (`components/Navbar.tsx`): sticky, `bg-cream/80` + backdrop blur, hairline bottom border. Inner container `max-w-5xl` (the site-wide content width — every page section uses `mx-auto max-w-5xl px-6`). Left = circular `hero.png` avatar + "Mohammad Saif". Center = Home / Project / Experience / Blog (mono, uppercase, moss underline-on-hover; `hidden md:flex`). Right (desktop) = bordered "Contact" button. **Mobile**: a hamburger (`md:hidden`) opens a right-side **slide-in sidebar** (`AnimatePresence`, tween slide `x:100%→0`, fading blurred backdrop, links stagger in, Contact pinned at bottom). The sidebar is a **sibling of `<header>`** (returned from a fragment), NOT a child — see gotchas. Navbar fades down on mount.
- **Hero** (`routes/index.tsx`): two-column (`lg:grid-cols-2`). Left = pulsing **amber** status dot (two staggered `easeOut` ripple rings) + status line + typewriter headline **Builder. / Brewer. / Coder.** (typed char-by-char via `useTypewriter`, last word `text-moss`, blinking cursor) + subtext (full-stack, no UX claims). Right = `hero.png` portrait with orbiting social + tech-stack icons (`useOrbit`, client-only, mounted post-hydration). Staggered reveal. **Left block centers on mobile** (`text-center lg:text-left`, status `justify-center lg:justify-start`, subtext `mx-auto lg:mx-0`).
- **Projects** (`routes/projects/index.tsx`, `01`): hairline `<ul>` list (not cards); each row a `Link` with hover bg + `ArrowUpRight` nudge; mono tag on the right.
- **Experience** (`routes/experience/index.tsx`, `02`): **scroll-reveal centered-spine timeline** from CV data (most-recent-first). Entries **alternate left/right of a central spine on `md+`** (text aligned toward the spine); on **mobile it's a left-rail layout** (line + nodes on the left, content left-aligned to the right). Each entry reveals on scroll via `whileInView` (`once`, `amount:0.4`) with staggered children — spine segment draws (`scaleY` origin-top, skipped on last entry), node pops, text rises. Current role's node is **moss with an infinite pulse ring**; past roles muted. Per-role **employment-type chip** (`Full-time` = moss/olive outline, `Intern` = neutral hairline).
- **Blog** (`routes/blog/index.tsx`, `03`): list style (not cards) of **real published posts** fetched from `GET /blogs`; each row links to `/blog/$slug` (date, generated excerpt, first tag, like count), with an empty state. Mirrors the experience two-column grid (`sm:grid-cols-[10rem_1fr]`, date left) with the projects-style row `Link` + `ArrowUpRight` hover.
- **Blog post** (`routes/blog/$slug.tsx`): public read page — fetches `GET /blogs/:slug` (which counts a view), renders banner + tags + date + **markdown body** (`prose`), and a footer with view count + `LikeButton`. Loading + 404 states.
- **Admin panel** (`routes/admin/*`) — **fully wired to the backend (real auth + live data).** Content width is `max-w-6xl` (wider than the public `max-w-5xl`). The public `Navbar` is hidden for `/admin` paths via a `pathname.startsWith('/admin')` check in `__root.tsx`. `admin/route.tsx` wraps the subtree in `AuthProvider` and **gates on auth**: while `/auth/me` resolves → spinner; guest → `AdminLogin`; authed → the panel's **own sticky top bar** (pulsing moss status dot, `Admin / Console` brand, Dashboard/New Post tabs, "View site" exit, **Logout** button) + `<Outlet/>`. (UI gating only — real security is the backend `requireAuth` on write routes.)
  - **Dashboard** (`admin/index.tsx`): **live data** from `GET /analytics/summary` and `GET /blogs/admin/list`. Scroll-triggered count-up (`useCountUp` + `useInView`, `once`) on the all-time **total visits** hero (with a unique-visitors pill); three **stat cards** (unique visitors / views today / avg per day; `ACCENT` static class map moss/rust); a **14-day visits bar chart** (staggered `scaleY`, moss bars, peak bar rust, hover tooltip); a **recent-posts** list (real titles, live status chip, date, views) where each row has **Edit** (→ `/admin/editor?edit=<id>`) and **Delete** (confirms → `DELETE /blogs/:id`) actions, plus an empty state.
  - **Editor** (`admin/editor/index.tsx`): **create OR edit**. `?edit=<id>` (route `validateSearch`) loads the post via `GET /blogs/admin/:id` and pre-fills the fields. Four fields — **Title**, **Banner Image** (URL field OR drag-drop/click file; the actual `File` is tracked in `bannerFile` for multipart upload, preview via `URL.createObjectURL`), **Tags** (chip input), **Content** (Markdown `<textarea>` + live `react-markdown` preview; side-by-side on `lg`, Write/Preview toggle on mobile). Save-draft / Publish submit a **`FormData`** to `POST /blogs` (create) or `PUT /blogs/:id` (edit) with `headers: {}` so the browser sets the multipart boundary; banner sent as a file (`banner`) or `bannerImg` URL, tags as a JSON string. Submitting state + spinner, error banner from the API, redirect to the dashboard on success.
- **Smooth scrolling** (`styles.css`): `scroll-behavior: smooth` on `html` + `main` (the real scroller), with a `prefers-reduced-motion: reduce` override → `auto`.
- **Favicon**: circular `public/assets/favicon.png` wired in `__root.tsx`.

## Conventions & gotchas

- Reference `public/` assets by URL (`'/assets/hero.png'`), do NOT import them.
- Typewriter/animations are client-only; initial SSR renders empty lines then types in on hydration (no layout shift — lines reserve height).
- Keep accent usage sparse — moss green is a highlight, not a fill.
- **The scroll container is `<main>`, not the window/body.** `<body>` is `overflow-hidden`; `<main>` owns the vertical scroll. So: target `main` for scroll CSS (`scroll-behavior`); for scroll-linked animation prefer `whileInView` (IntersectionObserver works against the viewport regardless) — `useScroll` would need a `container` ref to the `<main>` element. To scroll programmatically (e.g. in tests), scroll `document.querySelector('main')`, not `window`.
- **`backdrop-filter`/`filter` creates a containing block for `position: fixed` descendants.** The Navbar `<header>` has `backdrop-blur`, so a fixed overlay rendered *inside* it gets trapped (sized to the 72px bar). The mobile sidebar is therefore a **sibling of `<header>`** (Navbar returns a fragment) to stay viewport-fixed. Render any future full-screen fixed overlay outside the blurred header.
- For scroll-reveal, use the shared variant style (container `staggerChildren` + `whileInView` with `viewport={{ once: true, amount }}`), ease `[0.22,1,0.36,1]`.
- **Admin pages render outside the public Navbar.** `__root.tsx` hides `<Navbar/>` when `pathname.startsWith('/admin')`; the panel supplies its own chrome via `admin/route.tsx`. Admin content uses `mx-auto max-w-6xl px-6` (wider than the public `max-w-5xl`). Any new `/admin/*` route inherits the layout's top bar automatically.
- **Tailwind needs static class strings.** Color accents chosen at runtime (e.g. the dashboard `ACCENT` map keyed by `moss`/`rust`) must be written as full literal class names, not interpolated fragments like `` `text-${accent}` `` — the latter gets purged.
- **Backend calls go through `apiFetch`** (`src/lib/api.ts`), which always sends `credentials: 'include'` (cookies). For multipart uploads pass `headers: {}` to drop the default JSON content-type so the browser sets the boundary. Base URL is `VITE_API_URL` (set it to the deployed backend, e.g. `https://api.../api/v1`, in prod). Auth is a backend httpOnly cookie — the client never sees the token; it checks login state via `GET /auth/me`. Cookies are cross-site in prod, so frontend + backend sharing a parent domain keeps them first-party.
