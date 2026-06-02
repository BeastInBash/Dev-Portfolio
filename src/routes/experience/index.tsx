import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'motion/react'
import type { Variants } from 'motion/react'
import { PageHeading } from '#/components/PageHeading'

export const Route = createFileRoute('/experience/')({ component: Experience })

type Role = {
    period: string
    role: string
    org: string
    type: 'Full-time' | 'Intern'
    location?: string
    blurb: string
    current?: boolean
}

// Most recent first — sourced from CV.
const ROLES: Role[] = [
    {
        period: 'Jan 2026 — Now',
        role: 'Full Stack Engineer',
        org: 'Bhartics Ecom Services',
        type: 'Full-time',
        location: 'Kolkata',
        blurb: 'Owning full-stack delivery — building and shipping production features across the stack.',
        current: true,
    },
    {
        period: 'Aug 2025 — Jan 2026',
        role: 'Full-stack Developer',
        org: 'Bhartics Ecom Services',
        type: 'Intern',
        location: 'Kolkata',
        blurb: 'Built and maintained responsive web apps; deployed and scaled on AWS with S3 storage and backups, and designed user-friendly UI/UX.',
    },
    {
        period: 'Jan 2025 — Aug 2025',
        role: 'Back End Developer',
        org: 'Unicapp',
        type: 'Intern',
        blurb: 'Developed and maintained backend services for a delivery platform.',
    },
    {
        period: 'Sep 2024 — Oct 2024',
        role: 'React Native Developer',
        org: 'Appzat',
        type: 'Intern',
        location: 'Lucknow',
        blurb: 'Built cross-platform mobile features with React Native.',
    },
    {
        period: 'Aug 2024 — Sep 2024',
        role: 'React Developer',
        org: 'Appzat',
        type: 'Intern',
        location: 'Lucknow',
        blurb: 'Developed responsive interfaces in React.',
    },
    {
        period: 'Jun 2023 — Jan 2024',
        role: 'Frontend Web Developer',
        org: 'Brain Bytes',
        type: 'Intern',
        location: 'Lucknow',
        blurb: 'Built frontend web interfaces — where the habit of shipping for real users started.',
    },
]

// Per-entry reveal: the connector line draws, the node pops, then text rises.
const entry: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } },
}
const lineGrow: Variants = {
    hidden: { scaleY: 0 },
    show: { scaleY: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}
const dotPop: Variants = {
    hidden: { scale: 0, opacity: 0 },
    show: { scale: 1, opacity: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
}
const rise: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

function Experience() {
    return (
        <section className="mx-auto max-w-7xl px-6 pt-20 pb-24 lg:pt-28">
            <PageHeading
                index="02"
                label="Experience"
                title="The log so far."
                intro="From frontend beginnings to full-stack engineering — a few years of building and shipping real products, end to end."
            />

            <ol className="relative">
                {ROLES.map((r, i) => {
                    const isLast = i === ROLES.length - 1
                    return (
                        <motion.li
                            key={`${r.org}-${r.period}`}
                            variants={entry}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true, amount: 0.4 }}
                            className="relative grid gap-2 pb-12 pl-10 last:pb-0 sm:grid-cols-[11rem_1fr] sm:pl-12"
                        >
                            {/* connector line to the next node (skipped on the last entry) */}
                            {!isLast && (
                                <motion.span
                                    aria-hidden
                                    variants={lineGrow}
                                    className="absolute left-[4px] top-3 h-full w-px origin-top bg-line"
                                />
                            )}

                            {/* node */}
                            <motion.span
                                aria-hidden
                                variants={dotPop}
                                className="absolute left-0 top-2 flex h-[9px] w-[9px] items-center justify-center"
                            >
                                {r.current && (
                                    <motion.span
                                        className="absolute inset-0 rounded-full bg-moss"
                                        style={{ willChange: 'transform, opacity' }}
                                        initial={{ scale: 1, opacity: 0.5 }}
                                        animate={{ scale: 2.8, opacity: 0 }}
                                        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
                                    />
                                )}
                                <span
                                    className={`h-[9px] w-[9px] rounded-full ring-4 ring-cream ${r.current ? 'bg-moss' : 'bg-muted-warm'}`}
                                />
                            </motion.span>

                            <motion.span
                                variants={rise}
                                className="font-mono text-xs uppercase tracking-[0.18em] text-muted-warm"
                            >
                                {r.period}
                            </motion.span>

                            <motion.div variants={rise} className="max-w-xl">
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                                    <h2 className="font-serif text-2xl text-ink">
                                        {r.role} <span className="text-muted-warm">· {r.org}</span>
                                    </h2>
                                    <span
                                        className={`shrink-0 rounded-none border px-2.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.18em] ${
                                            r.type === 'Full-time'
                                                ? 'border-moss text-olive-500'
                                                : 'border-line text-neutral-700'
                                        }`}
                                    >
                                        {r.type}
                                    </span>
                                </div>
                                {r.location && (
                                    <p className="mt-1 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-warm">
                                        {r.location}
                                    </p>
                                )}
                                <p className="mt-2 font-display leading-relaxed text-muted-warm">
                                    {r.blurb}
                                </p>
                            </motion.div>
                        </motion.li>
                    )
                })}
            </ol>
        </section>
    )
}
