import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import { PageHeading } from '#/components/PageHeading'

export const Route = createFileRoute('/projects/')({ component: Projects })

const PROJECTS = [
    {
        title: 'Carbhartics',
        tag: 'Full-stack · MongoDb · Nextjs · Typescript ',
        blurb: 'One stop for you, to buy your dream car.',
        href: 'https://carbhartics.com',
    },
    {
        title: 'Tasker',
        tag: 'Reactjs · Nodejs · Expressjs · Typescript ',
        blurb: 'A Staff and Task Management Platform where you can assign and montior work given to the staff.',
        href: "https://employee-management-uzdd.vercel.app/",
    },

]

function Projects() {
    return (
        <section className="mx-auto max-w-5xl px-6 pt-20 pb-24 lg:pt-28">
            <PageHeading
                index="01"
                label="Projects"
                title="Selected work."
                intro="A few things I've built end-to-end — from data model and API to the polished interface on top."
            />

            <ul className="border-t border-line">
                {PROJECTS.map((p) => (
                    <li key={p.title}>
                        <Link
                            target='_blank'
                            to={p.href}
                            className="group flex flex-col gap-2 border-b border-line py-8 transition-colors hover:bg-ink/[0.02] sm:flex-row sm:items-baseline sm:justify-between"
                        >
                            <div className="max-w-xl">
                                <h2 className="font-serif text-2xl text-ink">
                                    {p.title}
                                    <ArrowUpRight className="ml-1 inline h-4 w-4 -translate-y-0.5 text-muted-warm transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-1" />
                                </h2>
                                <p className="mt-2 font-display leading-relaxed text-muted-warm">
                                    {p.blurb}
                                </p>
                            </div>
                            <span className="shrink-0 font-mono text-xs uppercase tracking-[0.18em] text-muted-warm">
                                {p.tag}
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    )
}
