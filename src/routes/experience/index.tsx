import { createFileRoute } from '@tanstack/react-router'
import { PageHeading } from '#/components/PageHeading'

export const Route = createFileRoute('/experience/')({ component: Experience })

const ROLES = [
    {
        period: '2025 — Now',
        role: 'Full-stack Developer',
        org: 'Freelance',
        blurb: 'Shipping web apps for early-stage teams — TanStack/React front ends on Node + Postgres back ends.',
    },
    {
        period: '2024 — 2025',
        role: 'Frontend Developer',
        org: 'Studio (contract)',
        blurb: 'Built marketing sites and dashboards with React, TypeScript and a heavy focus on motion and polish.',
    },
]

function Experience() {
    return (
        <section className="mx-auto max-w-7xl px-6 pt-20 pb-24 lg:pt-28">
            <PageHeading
                index="02"
                label="Experience"
                title="The log so far."
                intro="One year in, building real things for real users — and learning the whole stack along the way."
            />

            <ol className="border-t border-line">
                {ROLES.map((r) => (
                    <li
                        key={r.period}
                        className="grid gap-2 border-b border-line py-8 sm:grid-cols-[10rem_1fr]"
                    >
                        <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-warm">
                            {r.period}
                        </span>
                        <div className="max-w-xl">
                            <h2 className="font-serif text-2xl text-ink">
                                {r.role}{' '}
                                <span className="text-muted-warm">· {r.org}</span>
                            </h2>
                            <p className="mt-2 font-display leading-relaxed text-muted-warm">
                                {r.blurb}
                            </p>
                        </div>
                    </li>
                ))}
            </ol>
        </section>
    )
}
