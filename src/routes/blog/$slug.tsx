import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { ArrowLeft, Eye, LoaderCircle } from 'lucide-react'
import { apiFetch } from '#/lib/api'
import { LikeButton } from '#/components/LikeButton'
import { Prose } from '#/components/Prose'

export const Route = createFileRoute('/blog/$slug')({ component: BlogPost })

type Post = {
    _id: string
    title: string
    slug: string
    bannerImg?: string
    tags: string[]
    content: string
    views: number
    likes: number
    liked: boolean
    createdAt: string
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}

function BlogPost() {
    const { slug } = Route.useParams()
    const [post, setPost] = useState<Post | null>(null)
    const [state, setState] = useState<'loading' | 'ready' | 'notfound'>('loading')

    useEffect(() => {
        let active = true
        setState('loading')
        apiFetch(`/blogs/${slug}`)
            .then((res) => (res.ok ? res.json() : Promise.reject(res)))
            .then((data) => {
                if (!active) return
                setPost(data)
                setState('ready')
            })
            .catch(() => active && setState('notfound'))
        return () => {
            active = false
        }
    }, [slug])

    if (state === 'loading') {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <LoaderCircle className="h-6 w-6 animate-spin text-moss" strokeWidth={2} />
            </div>
        )
    }

    if (state === 'notfound' || !post) {
        return (
            <section className="mx-auto max-w-5xl px-6 pt-28 pb-24 text-center">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-rust">
                    404
                </p>
                <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-ink">
                    Post not found
                </h1>
                <Link
                    to="/blog"
                    className="mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-muted-warm transition-colors hover:text-ink"
                >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to blog
                </Link>
            </section>
        )
    }

    return (
        <article className="mx-auto max-w-3xl px-6 pt-20 pb-24 lg:pt-28">
            <Link
                to="/blog"
                className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-muted-warm transition-colors hover:text-ink"
            >
                <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-0.5" />
                Back to blog
            </Link>

            {/* Meta */}
            <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs uppercase tracking-[0.18em] text-muted-warm">
                <span>{formatDate(post.createdAt)}</span>
                {post.tags.map((t) => (
                    <span key={t} className="text-moss">
                        #{t}
                    </span>
                ))}
            </div>

            <h1 className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-5xl">
                {post.title}
            </h1>

            {post.bannerImg && (
                <img
                    src={post.bannerImg}
                    alt={post.title}
                    className="mt-8 aspect-[16/9] w-full rounded-sm border border-line object-cover"
                />
            )}

            {/* Body */}
            <Prose className="mt-10">{post.content}</Prose>

            {/* Footer: views + like */}
            <div className="mt-12 flex items-center justify-between border-t border-line pt-6">
                <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-muted-warm">
                    <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />
                    {post.views.toLocaleString()} views
                </span>
                <LikeButton
                    slug={post.slug}
                    initialLikes={post.likes}
                    initialLiked={post.liked}
                />
            </div>
        </article>
    )
}
