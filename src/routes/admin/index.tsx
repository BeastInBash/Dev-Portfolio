import { createFileRoute, Link } from '@tanstack/react-router'
import { motion, useInView } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import {
    ArrowUpRight,
    Eye,
    PenLine,
    Pencil,
    Trash2,
    TrendingUp,
    Users,
} from 'lucide-react'

import { apiFetch } from '#/lib/api'

export const Route = createFileRoute('/admin/')({ component: Dashboard })

type Summary = {
    totalVisits: number
    totalUniques: number
    viewsToday: number
    avgPerDay: number
    series: { date: string; visits: number; uniques: number }[]
}

// Stat-card layout is static; values are filled from the live summary.
const STAT_META = [
    { label: 'Unique visitors', key: 'totalUniques', icon: Users, accent: 'moss' },
    { label: 'Views today', key: 'viewsToday', icon: Eye, accent: 'rust' },
    { label: 'Avg. /day', key: 'avgPerDay', icon: TrendingUp, accent: 'moss' },
] as const

// Static class maps so Tailwind keeps the colored utilities at build time.
const ACCENT = {
    moss: {
        bar: 'border-l-2 border-moss',
        chip: 'bg-moss/10 text-moss',
        delta: 'text-moss',
    },
    rust: {
        bar: 'border-l-2 border-rust',
        chip: 'bg-rust/10 text-rust',
        delta: 'text-rust',
    },
} as const

type Post = {
    _id: string
    title: string
    slug: string
    status: 'draft' | 'published'
    views: number
    likes: number
    createdAt: string
}

// ── Count-up that runs once the element scrolls into view ─────────────────
function useCountUp(target: number, active: boolean, duration = 1100) {
    const [value, setValue] = useState(0)

    useEffect(() => {
        if (!active) return
        let raf = 0
        const start = performance.now()
        const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration)
            // easeOutExpo for a quick settle
            const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
            setValue(Math.round(target * eased))
            if (t < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf)
    }, [target, active, duration])

    return value
}

function StatCard({
    label,
    value,
    icon: Icon,
    accent,
    active,
}: {
    label: string
    value: number
    icon: typeof Users
    accent: keyof typeof ACCENT
    active: boolean
}) {
    const count = useCountUp(value, active)
    const c = ACCENT[accent]
    return (
        <div className={`border border-line bg-cream p-5 ${c.bar}`}>
            <div className="flex items-center justify-between">
                <span className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-warm">
                    {label}
                </span>
                <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${c.chip}`}>
                    <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                </span>
            </div>
            <p className="mt-4 font-display text-3xl font-bold tracking-tight text-ink">
                {count.toLocaleString()}
            </p>
        </div>
    )
}

function Dashboard() {
    const ref = useRef<HTMLDivElement>(null)
    const inView = useInView(ref, { once: true, amount: 0.3 })

    const [summary, setSummary] = useState<Summary | null>(null)
    const [posts, setPosts] = useState<Post[]>([])
    useEffect(() => {
        apiFetch('/analytics/summary')
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => data && setSummary(data))
            .catch(() => {})
        apiFetch('/blogs/admin/list')
            .then((res) => (res.ok ? res.json() : []))
            .then((data) => Array.isArray(data) && setPosts(data))
            .catch(() => {})
    }, [])

    async function deletePost(id: string) {
        if (!window.confirm('Delete this post? This cannot be undone.')) return
        const res = await apiFetch(`/blogs/${id}`, { method: 'DELETE' })
        if (res.ok) setPosts((ps) => ps.filter((p) => p._id !== id))
    }

    const total = useCountUp(summary?.totalVisits ?? 0, inView, 1500)
    const series = summary?.series.map((s) => s.visits) ?? []
    const peak = Math.max(1, ...series)

    return (
        <section
            ref={ref}
            className="mx-auto max-w-6xl px-6 pt-12 pb-24"
        >
            {/* Heading */}
            <header className="mb-12">
                <p className="mb-4 font-mono text-xs uppercase tracking-[0.22em] text-muted-warm">
                    00 <span className="text-line">/</span> Overview
                </p>
                <h1 className="font-display text-4xl font-bold leading-[0.95] tracking-tight text-ink sm:text-5xl">
                    Dashboard.
                </h1>
            </header>

            {/* Hero: total visits + new post CTA */}
            <div className="grid gap-px overflow-hidden border border-line bg-line lg:grid-cols-[1.6fr_1fr]">
                <div className="relative border-l-2 border-moss bg-cream p-8 sm:p-10">
                    <span className="font-mono text-xs uppercase tracking-[0.2em] text-rust">
                        Total visits — all time
                    </span>
                    <div className="mt-4 flex flex-wrap items-end gap-4">
                        <p className="font-display text-6xl font-bold tracking-tight text-ink sm:text-7xl">
                            {total.toLocaleString()}
                        </p>
                        <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-moss/10 px-2.5 py-1 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-moss">
                            <Users className="h-3.5 w-3.5" strokeWidth={2} />
                            {(summary?.totalUniques ?? 0).toLocaleString()} unique
                        </span>
                    </div>
                    <p className="mt-3 max-w-md font-display leading-relaxed text-muted-warm">
                        Cumulative page views across the portfolio since launch,
                        counted live as visitors browse the site.
                    </p>
                </div>

                <Link
                    to="/admin/editor"
                    className="group flex flex-col justify-between bg-ink p-8 text-cream transition-colors hover:bg-ink/90 sm:p-10"
                >
                    <PenLine className="h-6 w-6" strokeWidth={1.5} />
                    <div className="mt-10">
                        <p className="font-display text-2xl font-bold tracking-tight">
                            Write a new post
                        </p>
                        <span className="mt-2 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.16em] text-cream/70 transition-colors group-hover:text-cream">
                            Open editor
                            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </span>
                    </div>
                </Link>
            </div>

            {/* Stat cards */}
            <div className="mt-px grid gap-4 sm:grid-cols-3">
                {STAT_META.map((s) => (
                    <StatCard
                        key={s.label}
                        label={s.label}
                        value={summary?.[s.key] ?? 0}
                        icon={s.icon}
                        accent={s.accent}
                        active={inView}
                    />
                ))}
            </div>

            {/* Visits chart */}
            <div className="mt-12 border border-line bg-cream p-6 sm:p-8">
                <div className="mb-8 flex items-baseline justify-between">
                    <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-muted-warm">
                        Visits — last 14 days
                    </h2>
                    <span className="font-mono text-xs uppercase tracking-[0.16em] text-muted-warm">
                        peak {peak.toLocaleString()}
                    </span>
                </div>
                <div className="flex h-40 items-end gap-1.5 sm:gap-2">
                    {series.map((v, i) => (
                        <motion.div
                            key={i}
                            initial={{ scaleY: 0 }}
                            animate={inView ? { scaleY: 1 } : {}}
                            transition={{
                                duration: 0.6,
                                delay: 0.4 + i * 0.04,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                            style={{ height: `${(v / peak) * 100}%` }}
                            className={`group relative flex-1 origin-bottom transition-colors hover:bg-rust ${
                                v === peak ? 'bg-rust' : 'bg-moss/70'
                            }`}
                            title={`${v.toLocaleString()} visits`}
                        >
                            <span className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 font-mono text-[0.65rem] text-ink opacity-0 transition-opacity group-hover:opacity-100">
                                {v}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Recent posts */}
            <div className="mt-12">
                <div className="mb-4 flex items-baseline justify-between">
                    <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-muted-warm">
                        Recent posts
                    </h2>
                    <Link
                        to="/admin/editor"
                        className="font-mono text-xs uppercase tracking-[0.16em] text-muted-warm transition-colors hover:text-ink"
                    >
                        + New
                    </Link>
                </div>
                <ul className="border-t border-line">
                    {posts.length === 0 ? (
                        <li className="border-b border-line py-8 text-center font-serif text-muted-warm">
                            No posts yet.{' '}
                            <Link to="/admin/editor" className="text-moss hover:underline">
                                Write your first one
                            </Link>
                            .
                        </li>
                    ) : (
                        posts.map((p) => (
                            <li
                                key={p._id}
                                className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-line py-5 sm:grid-cols-[1fr_7rem_7rem_4rem_auto]"
                            >
                                <span className="font-serif text-lg text-ink">
                                    {p.title}
                                </span>
                                <span
                                    className={`hidden justify-self-start border px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.16em] sm:inline-block ${
                                        p.status === 'published'
                                            ? 'border-moss/40 bg-moss/10 text-moss'
                                            : 'border-rust/40 bg-rust/10 text-rust'
                                    }`}
                                >
                                    {p.status}
                                </span>
                                <span className="hidden font-mono text-xs uppercase tracking-[0.16em] text-muted-warm sm:inline">
                                    {p.createdAt.slice(0, 10)}
                                </span>
                                <span className="hidden justify-self-end font-mono text-xs text-muted-warm sm:inline">
                                    {p.views.toLocaleString()} views
                                </span>
                                <div className="flex items-center justify-self-end gap-1">
                                    <Link
                                        to="/admin/editor"
                                        search={{ edit: p._id }}
                                        aria-label={`Edit ${p.title}`}
                                        className="inline-flex h-8 w-8 items-center justify-center border border-line text-muted-warm transition-colors hover:border-moss/40 hover:text-moss"
                                    >
                                        <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => deletePost(p._id)}
                                        aria-label={`Delete ${p.title}`}
                                        className="inline-flex h-8 w-8 items-center justify-center border border-line text-muted-warm transition-colors hover:border-rust/40 hover:text-rust"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                                    </button>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </section>
    )
}
