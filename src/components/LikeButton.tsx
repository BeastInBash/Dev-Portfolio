import { useState } from 'react'
import { Heart } from 'lucide-react'
import { apiFetch } from '#/lib/api'

/**
 * Anonymous like toggle — no login. The backend keys likes to the visitor's
 * `vid` cookie (one like per device), so we just POST/DELETE and trust the
 * returned count. Optimistic: the heart fills instantly and rolls back on error.
 *
 * Drop into a blog detail/list row:
 *   <LikeButton slug={post.slug} initialLikes={post.likes} initialLiked={post.liked} />
 */
export function LikeButton({
    slug,
    initialLikes,
    initialLiked,
}: {
    slug: string
    initialLikes: number
    initialLiked: boolean
}) {
    const [likes, setLikes] = useState(initialLikes)
    const [liked, setLiked] = useState(initialLiked)
    const [busy, setBusy] = useState(false)

    async function toggle() {
        if (busy) return
        setBusy(true)
        const next = !liked
        // optimistic
        setLiked(next)
        setLikes((n) => n + (next ? 1 : -1))
        try {
            const res = await apiFetch(`/blogs/${slug}/like`, {
                method: next ? 'POST' : 'DELETE',
            })
            if (!res.ok) throw new Error('request failed')
            const data = await res.json()
            setLikes(data.likes)
            setLiked(data.liked)
        } catch {
            // rollback
            setLiked(!next)
            setLikes((n) => n + (next ? -1 : 1))
        } finally {
            setBusy(false)
        }
    }

    return (
        <button
            type="button"
            onClick={toggle}
            disabled={busy}
            aria-pressed={liked}
            aria-label={liked ? 'Unlike this post' : 'Like this post'}
            className="group inline-flex items-center gap-2 border border-line px-3 py-1.5 font-mono text-xs uppercase tracking-[0.16em] text-muted-warm transition-colors hover:border-rust/40 hover:text-rust disabled:opacity-60"
        >
            <Heart
                className={`h-3.5 w-3.5 transition-all ${
                    liked ? 'fill-rust text-rust' : 'text-muted-warm group-hover:text-rust'
                }`}
                strokeWidth={1.75}
            />
            {likes.toLocaleString()}
        </button>
    )
}
