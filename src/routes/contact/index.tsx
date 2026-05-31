import { createFileRoute } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import { PageHeading } from '#/components/PageHeading'

export const Route = createFileRoute('/contact/')({ component: Contact })

const CHANNELS = [
    { label: 'Email', value: 'saifdev0847@gmail.com', href: 'mailto:saifdev0847@gmail.com' },
    { label: 'LinkedIn', value: '/in/saifdev', href: 'https://www.linkedin.com/in/saifdev' },
    { label: 'Twitter', value: '@saifdev', href: 'https://twitter.com/saifdev' },
    { label: 'GitHub', value: '/saifdev', href: 'https://github.com/saifdev' },
]

function Contact() {
    return (
        <section className="mx-auto max-w-7xl px-6 pt-20 pb-24 lg:pt-28">
            <PageHeading
                index="03"
                label="Contact"
                title="Let's talk."
                intro="Open to freelance work and interesting conversations. The fastest way to reach me is email."
            />

            <ul className="border-t border-line">
                {CHANNELS.map((c) => (
                    <li key={c.label}>
                        <a
                            href={c.href}
                            target={c.href.startsWith('http') ? '_blank' : undefined}
                            rel={c.href.startsWith('http') ? 'noreferrer' : undefined}
                            className="group flex items-baseline justify-between gap-4 border-b border-line py-6 transition-colors hover:bg-ink/[0.02]"
                        >
                            <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-warm">
                                {c.label}
                            </span>
                            <span className="flex items-center gap-1 font-serif text-xl text-ink">
                                {c.value}
                                <ArrowUpRight className="h-4 w-4 text-muted-warm transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </span>
                        </a>
                    </li>
                ))}
            </ul>
        </section>
    )
}
