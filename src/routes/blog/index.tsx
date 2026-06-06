import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { ArrowUpRight, Heart } from 'lucide-react'
import { PageHeading } from '#/components/PageHeading'
import { apiFetch } from '#/lib/api'

export const Route = createFileRoute('/blog/')({ component: Blog })

type PostSummary = {
    _id: string
    title: string
    slug: string
    tags: string[]
    content: string
    likes: number
    createdAt: string
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}

// First ~160 chars of the body as a blurb (lightly strip markdown noise).
function excerpt(content: string) {
    const text = content.replace(/[#>*_`]/g, '').replace(/\s+/g, ' ').trim()
    return text.length > 160 ? `${text.slice(0, 160)}…` : text
}

function Blog() {
    const [posts, setPosts] = useState<PostSummary[] | null>(null)

    useEffect(() => {
        apiFetch('/blogs')
            .then((res) => (res.ok ? res.json() : []))
            .then((data) => setPosts(Array.isArray(data) ? data : []))
            .catch(() => setPosts([]))
    }, [])

    return (
        <section className="mx-auto max-w-5xl px-6 pt-20 pb-24 lg:pt-28">
            <PageHeading
                index="03"
                label="Blog"
                title="Things I've written."
                intro="Notes on building for the web — the tools, the trade-offs and the lessons from shipping real things."
            />

            {posts === null ? (
                <ol className="border-t border-line" aria-busy="true">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <li
                            key={i}
                            className="grid animate-pulse gap-2 border-b border-line py-8 sm:grid-cols-[10rem_1fr]"
                        >
                            <span className="h-3 w-24 rounded bg-ink/[0.07]" />
                            <div className="max-w-xl space-y-3">
                                <span className="block h-7 w-3/4 rounded bg-ink/[0.07]" />
                                <span className="block h-4 w-full rounded bg-ink/[0.05]" />
                                <span className="block h-4 w-2/3 rounded bg-ink/[0.05]" />
                                <span className="mt-3 block h-3 w-32 rounded bg-ink/[0.07]" />
                            </div>
                        </li>
                    ))}
                </ol>
            ) : posts.length === 0 ? (
                <p className="border-t border-line pt-8 font-display text-muted-warm">
                    No posts published yet — check back soon.
                </p>
            ) : (
                <ol className="border-t border-line">
                    {posts.map((p) => (
                        <li key={p._id}>
                            <Link
                                to="/blog/$slug"
                                params={{ slug: p.slug }}
                                className="group grid gap-2 border-b border-line py-8 transition-colors hover:bg-ink/[0.02] sm:grid-cols-[10rem_1fr]"
                            >
                                <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-warm">
                                    {formatDate(p.createdAt)}
                                </span>
                                <div className="max-w-xl">
                                    <h2 className="font-serif text-2xl text-ink">
                                        {p.title}
                                        <ArrowUpRight className="ml-1 inline h-4 w-4 -translate-y-0.5 text-muted-warm transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-1" />
                                    </h2>
                                    <p className="mt-2 font-display leading-relaxed text-muted-warm">
                                        {excerpt(p.content)}
                                    </p>
                                    <div className="mt-3 flex items-center gap-4 font-mono text-xs uppercase tracking-[0.18em] text-muted-warm">
                                        {p.tags.length > 0 && (
                                            <span className="text-moss">#{p.tags[0]}</span>
                                        )}
                                        <span className="inline-flex items-center gap-1.5">
                                            <Heart className="h-3 w-3" strokeWidth={1.75} />
                                            {p.likes.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ol>
            )}
        </section>
    )
}
