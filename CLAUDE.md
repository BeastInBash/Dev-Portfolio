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
    __root.tsx        # html shell, <head> (meta/title/favicon), renders <Navbar/> + <main>{children}</main>
    index.tsx         # "/" — hero section
    about/index.tsx   # "/about"
  components/
    Navbar.tsx        # sticky top nav
    ui/button.tsx     # shadcn
  lib/utils.ts        # shadcn cn()
  styles.css          # Tailwind import, @theme tokens, shadcn tokens, base layer
public/assets/
  hero.png            # portrait (1241x1268, ~3.3MB)
  favicon.png         # circular 256px crop of hero.png (favicon)
```

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

- **Navbar** (`components/Navbar.tsx`): sticky, `bg-cream/80` + backdrop blur, hairline bottom border, `max-w-7xl`. Left = circular `hero.png` avatar + "Mohammad Saif". Center = Home / Project / Experience (mono, uppercase, moss underline-on-hover). Right = bordered "Contact" button (ink→cream invert on hover, `ArrowUpRight`). Fades down on mount. Links use TanStack `Link to="/" hash="..."` (single-page sections: `top`/`projects`/`experience`/`contact`). No mobile menu yet (`hidden md:flex`).
- **Hero** (`routes/index.tsx`): two-column (`lg:grid-cols-2`). Left = pulsing **amber** status dot (two staggered `easeOut` ripple rings) + status line + typewriter headline **Builder. / Brewer. / Coder.** (typed char-by-char via `useTypewriter`, last word `text-moss`, blinking cursor) + subtext (full-stack, no UX claims) . Right = `hero.png` portrait. Staggered reveal. Stats block was intentionally removed.
- **Favicon**: circular `public/assets/favicon.png` wired in `__root.tsx`.

## Conventions & gotchas

- Reference `public/` assets by URL (`'/assets/hero.png'`), do NOT import them.
- Typewriter/animations are client-only; initial SSR renders empty lines then types in on hydration (no layout shift — lines reserve height).
- Keep accent usage sparse — moss green is a highlight, not a fill.
