import { createFileRoute } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import { PageHeading } from '#/components/PageHeading'

export const Route = createFileRoute('/blog/')({ component: Blog })

const POSTS = [
    {
        date: 'May 2026',
        title: 'Why I moved my portfolio to TanStack Start',
        tag: 'TanStack · SSR',
        blurb: 'File-based routing, real SSR and zero config — what I gained switching away from a hand-rolled setup.',
        href: '#',
    },
    {
        date: 'Apr 2026',
        title: 'Typewriter effects without the layout shift',
        tag: 'React · Motion',
        blurb: 'How I reserve line height up front so the hero never jumps as text types in on hydration.',
        href: '#',
    },
    {
        date: 'Mar 2026',
        title: 'Tailwind v4 is config-less — here is how I theme',
        tag: 'Tailwind · CSS',
        blurb: 'Dropping the JS config for @theme tokens in one stylesheet, and the warm palette it let me build.',
        href: '#',
    },
    {
        date: 'Feb 2026',
        title: 'A year of shipping full-stack, end to end',
        tag: 'Career · Notes',
        blurb: 'Lessons from twelve months owning the whole stack — from Postgres schemas to the last pixel.',
        href: '#',
    },
]

function Blog() {
    return (
        <section className="mx-auto max-w-7xl px-6 pt-20 pb-24 lg:pt-28">
            <PageHeading
                index="03"
                label="Blog"
                title="Things I've written."
                intro="Notes on building for the web — the tools, the trade-offs and the lessons from shipping real things."
            />

            <ol className="border-t border-line">
                {POSTS.map((p) => (
                    <li key={p.title}>
                        <a
                            href={p.href}
                            className="group grid gap-2 border-b border-line py-8 transition-colors hover:bg-ink/[0.02] sm:grid-cols-[10rem_1fr]"
                        >
                            <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-warm">
                                {p.date}
                            </span>
                            <div className="max-w-xl">
                                <h2 className="font-serif text-2xl text-ink">
                                    {p.title}
                                    <ArrowUpRight className="ml-1 inline h-4 w-4 -translate-y-0.5 text-muted-warm transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-1" />
                                </h2>
                                <p className="mt-2 font-display leading-relaxed text-muted-warm">
                                    {p.blurb}
                                </p>
                                <span className="mt-3 block font-mono text-xs uppercase tracking-[0.18em] text-muted-warm">
                                    {p.tag}
                                </span>
                            </div>
                        </a>
                    </li>
                ))}
            </ol>
        </section>
    )
}
