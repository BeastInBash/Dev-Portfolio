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
        <section className="mx-auto max-w-5xl px-6 pt-20 pb-24 lg:pt-28">
            <PageHeading
                index="02"
                label="Experience"
                title="The log so far."
                intro="From frontend beginnings to full-stack engineering — a few years of building and shipping real products, end to end."
            />

            {/* Centered spine timeline: entries alternate left/right of a central
                line on md+; stacks to a centered single column on mobile. */}
            <ol className="relative mx-auto max-w-4xl">
                {ROLES.map((r, i) => {
                    const isLast = i === ROLES.length - 1
                    const isLeft = i % 2 === 0
                    return (
                        <motion.li
                            key={`${r.org}-${r.period}`}
                            variants={entry}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true, amount: 0.4 }}
                            className="relative flex flex-col pb-14 pl-10 text-left last:pb-0 md:grid md:grid-cols-2 md:items-start md:gap-x-12 md:pl-0"
                        >
                            {/* spine segment to the next node (skipped on last) —
                                left rail on mobile, centered on md+ */}
                            {!isLast && (
                                <motion.span
                                    aria-hidden
                                    variants={lineGrow}
                                    className="absolute left-[4px] top-3 h-full w-px origin-top bg-line md:left-1/2 md:-translate-x-1/2"
                                />
                            )}

                            {/* node — on the left rail on mobile, on the spine on md+ */}
                            <motion.span
                                aria-hidden
                                variants={dotPop}
                                className="absolute left-0 top-2 flex h-[9px] w-[9px] items-center justify-center md:left-1/2 md:-translate-x-1/2"
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

                            {/* content — right of the left rail on mobile, on one
                                side of the spine on md+ */}
                            <motion.div
                                variants={rise}
                                className={`flex max-w-md flex-col items-start text-left md:max-w-none ${
                                    isLeft
                                        ? 'md:col-start-1 md:items-end md:pr-12 md:text-right'
                                        : 'md:col-start-2 md:items-start md:pl-12 md:text-left'
                                }`}
                            >
                                <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-warm">
                                    {r.period}
                                </span>
                                <div
                                    className={`mt-2 flex flex-wrap items-center justify-start gap-x-3 gap-y-2 ${
                                        isLeft ? 'md:justify-end' : 'md:justify-start'
                                    }`}
                                >
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
