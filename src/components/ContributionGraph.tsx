import { motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'

/**
 * GitHub-style contribution heatmap, themed to the warm editorial palette.
 * Pulls live data from the free jogruber proxy (no token) for each account,
 * caches per-username, and offers Beast / TheBeast01 / Combined tabs.
 *
 * We hit the FULL endpoint (no `?y=last`) on purpose: the `?y=last` shortcut is
 * served from a stale, public-only cache, so it misses private contributions
 * even when "Include private contributions" is enabled on the GitHub profile.
 * The full endpoint returns fresh, private-inclusive daily data, from which we
 * compute the rolling last-year window (and its total) ourselves.
 *
 * Empty cells use the hairline tone; the 1–4 intensity ramp is built from the
 * moss accent so the grid rhymes with the rest of the site instead of GitHub
 * green. Levels are recomputed for the Combined view since we sum two accounts.
 */

type Day = { date: string; count: number; level: number }
// `total` is a per-year map (e.g. { "2025": 624 }); we don't use it — totals are
// computed from the windowed daily data so they always match what's rendered.
type ApiResponse = { total: Record<string, number>; contributions: Day[] }

const ACCOUNTS = [
    { id: 'BeastInBash', label: 'BeastInBash' },
    { id: 'thebeast01', label: 'TheBeast01' },
] as const

type TabId = (typeof ACCOUNTS)[number]['id'] | 'combined'

const TABS: { id: TabId; label: string }[] = [
    ...ACCOUNTS.map((a) => ({ id: a.id as TabId, label: a.label })),
    { id: 'combined', label: 'Combined' },
]

// moss (#98971a → rgb 152 151 26) intensity ramp; index 0 is the empty cell.
const LEVEL_COLORS = [
    '#e4ddcd',
    'rgba(152, 151, 26, 0.32)',
    'rgba(152, 151, 26, 0.55)',
    'rgba(152, 151, 26, 0.8)',
    '#98971a',
] as const

const CELL = 11 // px — cell side
const GAP = 3 // px — gap between cells
const DAY_COL = 30 // px — width reserved for the Mon/Wed/Fri labels
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''] // rows Sun..Sat

const fmtDate = (iso: string) =>
    new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })

// Sum two accounts day-by-day, recomputing the intensity level from the total.
function combine(a: Day[], b: Day[]): Day[] {
    const map = new Map<string, number>()
    for (const d of a) map.set(d.date, d.count)
    for (const d of b) map.set(d.date, (map.get(d.date) ?? 0) + d.count)
    return [...map.entries()]
        .sort(([x], [y]) => (x < y ? -1 : 1))
        .map(([date, count]) => ({
            date,
            count,
            level:
                count === 0 ? 0 : count <= 3 ? 1 : count <= 7 ? 2 : count <= 12 ? 3 : 4,
        }))
}

// Slice the full daily history down to the rolling last-year window (365 days
// ending today) and total it, so the heading matches exactly what's rendered.
function lastYear(days: Day[]): { days: Day[]; total: number } {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const toISO = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
            d.getDate(),
        ).padStart(2, '0')}`
    const todayISO = toISO(today)
    const cutoff = new Date(today)
    cutoff.setDate(cutoff.getDate() - 364)
    const cutISO = toISO(cutoff)
    // Lower AND upper bound: the full endpoint pads the current calendar year
    // with future-dated empty days, which would render as trailing blank weeks.
    // It also returns days grouped by year rather than one globally-sorted list,
    // so sort before handing to toWeeks (which assumes ascending order).
    const windowed = days
        .filter((d) => d.date >= cutISO && d.date <= todayISO)
        .sort((a, b) => (a.date < b.date ? -1 : 1))
    return { days: windowed, total: windowed.reduce((s, d) => s + d.count, 0) }
}

// Group daily cells into week-columns (Sun..Sat), padding partial first/last weeks.
function toWeeks(days: Day[]): (Day | null)[][] {
    const weeks: (Day | null)[][] = []
    let week: (Day | null)[] = new Array(7).fill(null)
    for (const day of days) {
        const wd = new Date(day.date + 'T00:00:00').getDay()
        week[wd] = day
        if (wd === 6) {
            weeks.push(week)
            week = new Array(7).fill(null)
        }
    }
    if (week.some(Boolean)) weeks.push(week)
    return weeks
}

// First day of each week → month label, emitted only when the month changes.
function monthLabels(weeks: (Day | null)[][]): (string | null)[] {
    let last = -1
    return weeks.map((week) => {
        const first = week.find(Boolean)
        if (!first) return null
        const m = new Date(first.date + 'T00:00:00').getMonth()
        if (m !== last) {
            last = m
            return new Date(first.date + 'T00:00:00').toLocaleDateString('en-US', {
                month: 'short',
            })
        }
        return null
    })
}

export function ContributionGraph() {
    const [tab, setTab] = useState<TabId>('BeastInBash')
    const [cache, setCache] = useState<Record<string, ApiResponse>>({})
    const [error, setError] = useState<string | null>(null)

    // Fetch whatever the active tab needs (one account, or both for Combined).
    useEffect(() => {
        const needed =
            tab === 'combined' ? ACCOUNTS.map((a) => a.id) : [tab]
        const missing = needed.filter((u) => !cache[u])
        if (missing.length === 0) return

        let cancelled = false
        setError(null)
        Promise.all(
            missing.map((u) =>
                fetch(`https://github-contributions-api.jogruber.de/v4/${u}`)
                    .then((r) => {
                        if (!r.ok) throw new Error(`HTTP ${r.status}`)
                        return r.json() as Promise<ApiResponse>
                    })
                    .then((data) => [u, data] as const),
            ),
        )
            .then((pairs) => {
                if (cancelled) return
                setCache((prev) => ({ ...prev, ...Object.fromEntries(pairs) }))
            })
            .catch(() => {
                if (!cancelled) setError('Could not load contributions right now.')
            })
        return () => {
            cancelled = true
        }
    }, [tab, cache])

    const { days, total, ready } = useMemo(() => {
        if (tab === 'combined') {
            const a = cache['BeastInBash']
            const b = cache['thebeast01']
            if (!a || !b) return { days: [], total: 0, ready: false }
            const { days, total } = lastYear(
                combine(a.contributions, b.contributions),
            )
            return { days, total, ready: true }
        }
        const data = cache[tab]
        if (!data) return { days: [], total: 0, ready: false }
        const { days, total } = lastYear(data.contributions)
        return { days, total, ready: true }
    }, [tab, cache])

    const weeks = useMemo(() => toWeeks(days), [days])
    const months = useMemo(() => monthLabels(weeks), [weeks])

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-xl border border-line bg-ink/[0.015] p-5 sm:p-7"
        >
            {/* header: count + tabs */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between">
                <h3 className="font-display text-xl text-ink">
                    {ready ? (
                        <>
                            <span className="font-semibold">{total.toLocaleString()}</span>{' '}
                            contributions in the last year
                        </>
                    ) : (
                        <span className="text-muted-warm">Loading contributions…</span>
                    )}
                </h3>

                <div className="flex shrink-0 gap-1 rounded-lg border border-line p-1">
                    {TABS.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`rounded-md px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors ${
                                tab === t.id
                                    ? 'bg-moss/12 text-moss'
                                    : 'text-muted-warm hover:text-ink'
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {error ? (
                <p className="py-10 text-center font-mono text-xs uppercase tracking-[0.12em] text-muted-warm">
                    {error}
                </p>
            ) : (
                <div className="overflow-x-auto pb-1">
                    <div className="min-w-max">
                        {/* month labels */}
                        <div
                            className="mb-1.5 flex h-3.5 items-end font-mono text-[10px] uppercase tracking-[0.1em] text-muted-warm"
                            style={{ paddingLeft: DAY_COL + GAP, gap: GAP }}
                        >
                            {months.map((m, i) => (
                                <div
                                    key={i}
                                    className="relative shrink-0"
                                    style={{ width: CELL }}
                                >
                                    {m && (
                                        <span className="absolute bottom-0 left-0 whitespace-nowrap">
                                            {m}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* day labels + week columns */}
                        <div className="mt-1.5 flex" style={{ gap: GAP }}>
                            <div
                                className="flex flex-col justify-between font-mono text-[10px] text-muted-warm"
                                style={{ width: DAY_COL, gap: GAP }}
                            >
                                {DAY_LABELS.map((d, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center"
                                        style={{ height: CELL }}
                                    >
                                        {d}
                                    </div>
                                ))}
                            </div>

                            {weeks.map((week, wi) => (
                                <div
                                    key={wi}
                                    className="flex flex-col"
                                    style={{ gap: GAP }}
                                >
                                    {week.map((day, di) => (
                                        <div
                                            key={di}
                                            title={
                                                day
                                                    ? `${day.count} contribution${
                                                          day.count === 1 ? '' : 's'
                                                      } on ${fmtDate(day.date)}`
                                                    : undefined
                                            }
                                            className="rounded-[2px] transition-transform duration-150 hover:scale-125"
                                            style={{
                                                width: CELL,
                                                height: CELL,
                                                backgroundColor: day
                                                    ? LEVEL_COLORS[day.level]
                                                    : 'transparent',
                                            }}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>

                        {/* legend */}
                        <div className="mt-4 flex items-center justify-end gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-warm">
                            <span>Less</span>
                            {LEVEL_COLORS.map((c, i) => (
                                <div
                                    key={i}
                                    className="rounded-[2px]"
                                    style={{ width: CELL, height: CELL, backgroundColor: c }}
                                />
                            ))}
                            <span>More</span>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    )
}
