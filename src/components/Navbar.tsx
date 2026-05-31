import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'

const heroImg = '/assets/hero.png'

const links = [
  { label: 'Home', to: '/' },
  { label: 'Project', to: '/projects' },
  { label: 'Experience', to: '/experience' },
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

export const Navbar = () => {
  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 border-b border-line/70 bg-cream/80 backdrop-blur-md"
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6">
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

        {/* Center: nav links */}
        <nav className="hidden items-center gap-9 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} label={l.label} to={l.to} />
          ))}
        </nav>

        {/* Right: contact button */}
        <Link
          to="/contact"
          className="group inline-flex items-center gap-1.5  border border-ink px-4 py-2 font-mono text-xs uppercase tracking-[0.16em] text-ink transition-colors hover:bg-ink hover:text-cream"
        >
          Contact
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </motion.header>
  )
}
