import { createFileRoute } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import { PageHeading } from '#/components/PageHeading'

export const Route = createFileRoute('/blog/')({ component: Blog })

const POSTS = [
    {
        date: 'Soon...',
        title: 'Comming Soon....',
        tag: 'Working on It',
        blurb: "Work on  the Editor is under development. Once its done i'll add my blogs. ",
        href: '#',
    },
]

function Blog() {
    return (
        <section className="mx-auto max-w-5xl px-6 pt-20 pb-24 lg:pt-28">
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
