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
    blog/index.tsx      # "/blog" — 03, list style (dummy posts)
    contact/            # "/contact"
  components/
    Navbar.tsx          # sticky top nav + mobile hamburger → slide-in sidebar
    PageHeading.tsx     # shared editorial header (mono eyebrow `NN / LABEL` + display title + intro)
    ui/button.tsx       # shadcn
  lib/utils.ts          # shadcn cn()
  styles.css            # Tailwind import, @theme tokens, shadcn tokens, base layer, smooth-scroll rules
public/assets/
  hero.png              # portrait (1241x1268, ~3.3MB)
  favicon.png           # circular 256px crop of hero.png (favicon)
```

Section numbering convention: Projects = `01`, Experience = `02`, Blog = `03` (passed as `index` to `PageHeading`).

## Design system (apply to ALL UI)

Warm editorial minimalism with an "engineering-log / terminal" meta layer. Heavy whitespace, hairline borders, sections numbered like `01 / NOW`.

**Palette** (Tailwind `@theme` tokens in `styles.css`):
- `--color-cream` `#f3efe8` — page background (`bg-cream`)
- `--color-ink` `#1a1a1a` — primary text (`text-ink`)
- `--color-muted-warm` `#8a8278` — secondary text (`text-muted-warm`)
- `--color-moss` `#98971a` — **accent (gruvbox green)**, used sparingly (`text-moss`/`bg-moss`): one headline word, nav hover underline, typewriter cursor
- `--color-line` `#ddd6ca` — hairline borders (`border-line`)
- Note: the hero status dot uses **amber** (`bg-amber-500`) deliberately, distinct from the green accent.

**Typography — three roles:**
- Display sans = **Inter Tight** (`font-display`) — huge tight bold headings.
- Serif = **Newsreader** (`font-serif`) — card/article titles (editorial substance).
- Mono = **JetBrains Mono** (`font-mono`) — ALL meta: eyebrows, section numbers, tags, timestamps, labels. Uppercase + letter-spaced.

**Motion conventions:** staggered fade-up reveals (container `staggerChildren` + a `rise` variant, ease `[0.22,1,0.36,1]`); subtle hover micro-interactions (arrow translate, underline grow); tasteful and slow, not bouncy. Keep ripple/loop animations seamless (fade fully before reset).

## What's built so far

- **Layout shell** (`routes/__root.tsx`): fixed-height flex column — `<body>` is `h-screen overflow-hidden`, a `flex h-screen flex-col` wraps `<Navbar/>` + `<main>`, and **`<main>` is the scroll container** (`flex-1 overflow-y-auto overflow-x-hidden`). `overflow-x-hidden` clips the per-route slide-in animation (`AnimatedOutlet` re-keys on pathname, slides `x:100%→0`).
- **Navbar** (`components/Navbar.tsx`): sticky, `bg-cream/80` + backdrop blur, hairline bottom border. Inner container `max-w-5xl` (the site-wide content width — every page section uses `mx-auto max-w-5xl px-6`). Left = circular `hero.png` avatar + "Mohammad Saif". Center = Home / Project / Experience / Blog (mono, uppercase, moss underline-on-hover; `hidden md:flex`). Right (desktop) = bordered "Contact" button. **Mobile**: a hamburger (`md:hidden`) opens a right-side **slide-in sidebar** (`AnimatePresence`, tween slide `x:100%→0`, fading blurred backdrop, links stagger in, Contact pinned at bottom). The sidebar is a **sibling of `<header>`** (returned from a fragment), NOT a child — see gotchas. Navbar fades down on mount.
- **Hero** (`routes/index.tsx`): two-column (`lg:grid-cols-2`). Left = pulsing **amber** status dot (two staggered `easeOut` ripple rings) + status line + typewriter headline **Builder. / Brewer. / Coder.** (typed char-by-char via `useTypewriter`, last word `text-moss`, blinking cursor) + subtext (full-stack, no UX claims). Right = `hero.png` portrait with orbiting social + tech-stack icons (`useOrbit`, client-only, mounted post-hydration). Staggered reveal. **Left block centers on mobile** (`text-center lg:text-left`, status `justify-center lg:justify-start`, subtext `mx-auto lg:mx-0`).
- **Projects** (`routes/projects/index.tsx`, `01`): hairline `<ul>` list (not cards); each row a `Link` with hover bg + `ArrowUpRight` nudge; mono tag on the right.
- **Experience** (`routes/experience/index.tsx`, `02`): **scroll-reveal centered-spine timeline** from CV data (most-recent-first). Entries **alternate left/right of a central spine on `md+`** (text aligned toward the spine); on **mobile it's a left-rail layout** (line + nodes on the left, content left-aligned to the right). Each entry reveals on scroll via `whileInView` (`once`, `amount:0.4`) with staggered children — spine segment draws (`scaleY` origin-top, skipped on last entry), node pops, text rises. Current role's node is **moss with an infinite pulse ring**; past roles muted. Per-role **employment-type chip** (`Full-time` = moss/olive outline, `Intern` = neutral hairline).
- **Blog** (`routes/blog/index.tsx`, `03`): list style (not cards), 4 dummy posts. Mirrors the experience two-column grid (`sm:grid-cols-[10rem_1fr]`, date left) with the projects-style row `Link` + `ArrowUpRight` hover.
- **Smooth scrolling** (`styles.css`): `scroll-behavior: smooth` on `html` + `main` (the real scroller), with a `prefers-reduced-motion: reduce` override → `auto`.
- **Favicon**: circular `public/assets/favicon.png` wired in `__root.tsx`.

## Conventions & gotchas

- Reference `public/` assets by URL (`'/assets/hero.png'`), do NOT import them.
- Typewriter/animations are client-only; initial SSR renders empty lines then types in on hydration (no layout shift — lines reserve height).
- Keep accent usage sparse — moss green is a highlight, not a fill.
- **The scroll container is `<main>`, not the window/body.** `<body>` is `overflow-hidden`; `<main>` owns the vertical scroll. So: target `main` for scroll CSS (`scroll-behavior`); for scroll-linked animation prefer `whileInView` (IntersectionObserver works against the viewport regardless) — `useScroll` would need a `container` ref to the `<main>` element. To scroll programmatically (e.g. in tests), scroll `document.querySelector('main')`, not `window`.
- **`backdrop-filter`/`filter` creates a containing block for `position: fixed` descendants.** The Navbar `<header>` has `backdrop-blur`, so a fixed overlay rendered *inside* it gets trapped (sized to the 72px bar). The mobile sidebar is therefore a **sibling of `<header>`** (Navbar returns a fragment) to stay viewport-fixed. Render any future full-screen fixed overlay outside the blurred header.
- For scroll-reveal, use the shared variant style (container `staggerChildren` + `whileInView` with `viewport={{ once: true, amount }}`), ease `[0.22,1,0.36,1]`.
