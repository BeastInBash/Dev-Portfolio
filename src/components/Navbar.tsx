import { Link } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'motion/react'
import type { Variants } from 'motion/react'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { useState } from 'react'

const heroImg = '/assets/hero.png'

const links = [
  { label: 'Home', to: '/' },
  { label: 'Project', to: '/projects' },
  { label: 'Experience', to: '/experience' },
  { label: 'Blog', to: '/blog' },
] as const

function NavLink({ label, to }: { label: string; to: string }) {
  return (
    <Link
      to={to}
      activeOptions={to === '/' ? { exact: true } : undefined}
      className="group relative font-bold font-mono text-xs uppercase tracking-[0.18em] text-ink/70 transition-colors hover:text-ink data-[status=active]:text-ink"
    >
      {label}
      <span className="absolute -bottom-1 left-0 h-px w-0 bg-moss transition-[width] duration-300 ease-out group-hover:w-full group-data-[status=active]:w-full" />
    </Link>
  )
}

// Panel slides in from the right; links stagger in once the panel is in place.
const panel: Variants = {
  hidden: { x: '100%' },
  show: {
    x: 0,
    transition: {
      type: 'tween',
      ease: [0.22, 1, 0.36, 1],
      duration: 0.45,
      when: 'beforeChildren',
      staggerChildren: 0.07,
      delayChildren: 0.12,
    },
  },
  exit: {
    x: '100%',
    transition: { type: 'tween', ease: [0.22, 1, 0.36, 1], duration: 0.35 },
  },
}

const item: Variants = {
  hidden: { opacity: 0, x: 24 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

export const Navbar = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 border-b border-line/70 bg-cream/80 backdrop-blur-md"
    >
      <div className="mx-auto flex h-18 max-w-5xl items-center justify-between px-6">
        {/* Left: avatar + name */}
        <Link to="/" className="group flex items-center gap-3">
          <img
            src={heroImg}
            alt="Mohammad Saif"
            className="h-9 w-9 rounded-full object-cover ring-1 ring-line transition-transform duration-300 group-hover:scale-105"
          />
          <span className=" text-md font-mono font-semibold tracking-tight">
            Mohammad Saif
          </span>
        </Link>

        {/* Center: nav links (desktop) */}
        <nav className="hidden items-center gap-9 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} label={l.label} to={l.to} />
          ))}
        </nav>

        {/* Right: contact button (desktop) */}
        <Link
          to="/contact"
          className="group hidden items-center gap-1.5 border border-ink px-4 py-2 font-mono text-xs uppercase tracking-[0.16em] text-ink transition-colors hover:bg-ink hover:text-cream md:inline-flex"
        >
          Contact
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>

        {/* Right: hamburger (mobile) */}
        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className="-mr-2 inline-flex h-10 w-10 items-center justify-center text-ink transition-colors hover:text-moss md:hidden"
        >
          <Menu className="h-6 w-6" strokeWidth={1.75} />
        </button>
      </div>
    </motion.header>

      {/* Mobile slide-in sidebar (sibling of <header> so it isn't trapped by the
          header's backdrop-filter containing block — keeps it viewport-fixed) */}
      <AnimatePresence>
        {open && (
          <div className="md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[55] bg-ink/30 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.aside
              variants={panel}
              initial="hidden"
              animate="show"
              exit="exit"
              className="fixed inset-y-0 right-0 z-[60] flex w-[78%] max-w-xs flex-col border-l border-line bg-cream px-6 py-6 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-[0.22em] text-muted-warm">
                  Menu
                </span>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className="-mr-2 inline-flex h-10 w-10 items-center justify-center text-ink transition-colors hover:text-moss"
                >
                  <X className="h-6 w-6" strokeWidth={1.75} />
                </button>
              </div>

              <nav className="mt-10 flex flex-col gap-7">
                {links.map((l) => (
                  <motion.div key={l.to} variants={item}>
                    <Link
                      to={l.to}
                      activeOptions={l.to === '/' ? { exact: true } : undefined}
                      onClick={() => setOpen(false)}
                      className="group relative inline-block font-mono text-lg font-bold uppercase tracking-[0.16em] text-ink/80 transition-colors hover:text-ink data-[status=active]:text-ink"
                    >
                      {l.label}
                      <span className="absolute -bottom-1 left-0 h-px w-0 bg-moss transition-[width] duration-300 ease-out group-hover:w-full group-data-[status=active]:w-full" />
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <motion.div variants={item} className="mt-auto">
                <Link
                  to="/contact"
                  onClick={() => setOpen(false)}
                  className="group inline-flex w-full items-center justify-center gap-1.5 border border-ink px-4 py-3 font-mono text-xs uppercase tracking-[0.16em] text-ink transition-colors hover:bg-ink hover:text-cream"
                >
                  Contact
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </motion.div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
