import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
    AlertCircle,
    Check,
    Eye,
    ImageIcon,
    LoaderCircle,
    Pencil,
    Save,
    Tag,
    X,
} from 'lucide-react'
import { apiFetch } from '#/lib/api'

export const Route = createFileRoute('/admin/editor/')({
    component: Editor,
    // `?edit=<id>` switches the editor into edit mode for an existing post.
    validateSearch: (search: Record<string, unknown>): { edit?: string } => ({
        edit: typeof search.edit === 'string' ? search.edit : undefined,
    }),
})

const STARTER = `# Start writing…

Use **Markdown** to structure your post. You can add:

- Lists and \`inline code\`
- [Links](https://example.com)
- Tables, quotes and more (GitHub-flavored)

> The preview on the right updates as you type.

\`\`\`ts
const hello = (name: string) => \`Hi, \${name}\`
\`\`\`
`

type Mode = 'write' | 'preview'

function Editor() {
    const navigate = useNavigate()
    const { edit } = Route.useSearch()
    const [editingId, setEditingId] = useState<string | null>(null)
    const [title, setTitle] = useState('')
    const [banner, setBanner] = useState('')
    const [bannerFile, setBannerFile] = useState<File | null>(null)
    const [tags, setTags] = useState<string[]>(['engineering', 'web'])
    const [tagDraft, setTagDraft] = useState('')
    const [content, setContent] = useState(STARTER)
    const [mode, setMode] = useState<Mode>('write')
    const [saved, setSaved] = useState<null | 'draft' | 'published'>(null)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const fileRef = useRef<HTMLInputElement>(null)

    // Edit mode: pull the existing post and pre-fill the form.
    useEffect(() => {
        if (!edit) return
        apiFetch(`/blogs/admin/${edit}`)
            .then((res) => (res.ok ? res.json() : null))
            .then((p) => {
                if (!p) return
                setEditingId(p._id)
                setTitle(p.title ?? '')
                setBanner(p.bannerImg ?? '')
                setBannerFile(null)
                setTags(Array.isArray(p.tags) ? p.tags : [])
                setContent(p.content ?? '')
            })
            .catch(() => setError('Could not load the post to edit'))
    }, [edit])

    const { words, minutes } = useMemo(() => {
        const w = content.trim() ? content.trim().split(/\s+/).length : 0
        return { words: w, minutes: Math.max(1, Math.round(w / 200)) }
    }, [content])

    function addTag(raw: string) {
        const t = raw.trim().replace(/,$/, '').toLowerCase()
        if (t && !tags.includes(t)) setTags((p) => [...p, t])
        setTagDraft('')
    }

    function onTagKey(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            addTag(tagDraft)
        } else if (e.key === 'Backspace' && !tagDraft && tags.length) {
            setTags((p) => p.slice(0, -1))
        }
    }

    function onBannerFile(file?: File) {
        if (file && file.type.startsWith('image/')) {
            setBannerFile(file)
            setBanner(URL.createObjectURL(file))
        }
    }

    async function submit(kind: 'draft' | 'published') {
        if (submitting) return
        setError(null)
        setSubmitting(true)
        try {
            const form = new FormData()
            form.append('title', title.trim())
            form.append('content', content)
            form.append('status', kind)
            form.append('tags', JSON.stringify(tags))
            if (bannerFile) {
                // multipart file → backend uploads it to ImageKit
                form.append('banner', bannerFile)
            } else if (banner && !banner.startsWith('blob:')) {
                // a pasted URL
                form.append('bannerImg', banner.trim())
            }

            // Empty headers so the browser sets the multipart boundary itself
            // (apiFetch otherwise forces application/json). PUT when editing.
            const res = await apiFetch(
                editingId ? `/blogs/${editingId}` : '/blogs',
                {
                    method: editingId ? 'PUT' : 'POST',
                    body: form,
                    headers: {},
                },
            )
            const data = await res.json().catch(() => null)
            if (!res.ok) {
                throw new Error(data?.message ?? 'Failed to save post')
            }

            setSaved(kind)
            // brief acknowledgement, then go to the dashboard where it now lists
            window.setTimeout(() => navigate({ to: '/admin' }), 900)
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Something went wrong')
            setSubmitting(false)
        }
    }

    const canPublish = title.trim().length > 0 && content.trim().length > 0

    return (
        <section className="mx-auto max-w-6xl px-6 pt-12 pb-24">
            {/* Top: title meta + actions */}
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="mb-3 font-mono text-xs uppercase tracking-[0.22em] text-muted-warm">
                        <span className="text-rust">Editor</span>{' '}
                    <span className="text-line">/</span> {editingId ? 'Edit post' : 'New post'}
                    </p>
                    <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                        {editingId ? 'Edit' : 'Compose'}
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <span className="hidden font-mono text-xs uppercase tracking-[0.16em] text-muted-warm sm:inline">
                        {words} words · {minutes} min read
                    </span>
                    <button
                        type="button"
                        disabled={submitting}
                        onClick={() => submit('draft')}
                        className="inline-flex items-center gap-1.5 border border-line px-4 py-2 font-mono text-xs uppercase tracking-[0.16em] text-ink transition-colors hover:bg-ink/[0.04] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Save className="h-3.5 w-3.5" strokeWidth={1.75} />
                        Save draft
                    </button>
                    <button
                        type="button"
                        disabled={!canPublish || submitting}
                        onClick={() => submit('published')}
                        className="inline-flex items-center gap-1.5 bg-moss px-4 py-2 font-mono text-xs uppercase tracking-[0.16em] text-cream transition-colors hover:bg-moss/90 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {submitting && (
                            <LoaderCircle className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
                        )}
                        Publish
                    </button>
                </div>
            </div>

            {saved && (
                <div className="mb-6 inline-flex items-center gap-2 border border-moss/40 bg-moss/[0.06] px-3 py-2 font-mono text-xs uppercase tracking-[0.16em] text-moss">
                    <Check className="h-3.5 w-3.5" strokeWidth={2} />
                    {saved === 'draft' ? 'Draft saved' : 'Published'} — redirecting…
                </div>
            )}

            {error && (
                <div className="mb-6 inline-flex items-center gap-2 border border-rust/40 bg-rust/[0.06] px-3 py-2 font-mono text-xs uppercase tracking-[0.16em] text-rust">
                    <AlertCircle className="h-3.5 w-3.5" strokeWidth={2} />
                    {error}
                </div>
            )}

            {/* Meta fields */}
            <div className="grid gap-6 border-y border-line py-8 lg:grid-cols-2">
                {/* Title */}
                <div className="lg:col-span-2">
                    <label className="mb-2 block font-mono text-xs uppercase tracking-[0.18em] text-muted-warm">
                        Title
                    </label>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="A clear, specific headline"
                        className="w-full border-none bg-transparent p-0 font-display text-3xl font-bold tracking-tight text-ink outline-none placeholder:text-muted-warm/50 sm:text-4xl"
                    />
                </div>

                {/* Banner image */}
                <div>
                    <label className="mb-2 block font-mono text-xs uppercase tracking-[0.18em] text-muted-warm">
                        <ImageIcon className="mr-1.5 inline h-3.5 w-3.5 -translate-y-px text-rust" />
                        Banner image
                    </label>
                    <input
                        value={banner.startsWith('blob:') ? '' : banner}
                        onChange={(e) => {
                            setBannerFile(null) // typing a URL clears any picked file
                            setBanner(e.target.value)
                        }}
                        placeholder="Paste an image URL…"
                        className="w-full border border-line bg-cream px-3 py-2 font-mono text-xs text-ink outline-none transition-colors placeholder:text-muted-warm/60 focus:border-ink"
                    />
                    <div
                        onClick={() => fileRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            e.preventDefault()
                            onBannerFile(e.dataTransfer.files[0])
                        }}
                        className="group mt-3 flex aspect-[16/7] cursor-pointer items-center justify-center overflow-hidden border border-dashed border-line bg-ink/[0.02] transition-colors hover:border-ink/40"
                    >
                        {banner ? (
                            <img
                                src={banner}
                                alt="Banner preview"
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span className="px-4 text-center font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-warm">
                                Drop an image or click to browse
                            </span>
                        )}
                    </div>
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => onBannerFile(e.target.files?.[0])}
                    />
                </div>

                {/* Tags */}
                <div>
                    <label className="mb-2 block font-mono text-xs uppercase tracking-[0.18em] text-muted-warm">
                        <Tag className="mr-1.5 inline h-3.5 w-3.5 -translate-y-px text-moss" />
                        Tags
                    </label>
                    <div className="flex flex-wrap items-center gap-2 border border-line bg-cream px-3 py-2 focus-within:border-ink">
                        {tags.map((t) => (
                            <span
                                key={t}
                                className="inline-flex items-center gap-1 border border-moss/30 bg-moss/10 px-2 py-1 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-moss"
                            >
                                {t}
                                <button
                                    type="button"
                                    onClick={() =>
                                        setTags((p) => p.filter((x) => x !== t))
                                    }
                                    className="text-moss/60 transition-colors hover:text-moss"
                                    aria-label={`Remove ${t}`}
                                >
                                    <X className="h-3 w-3" strokeWidth={2} />
                                </button>
                            </span>
                        ))}
                        <input
                            value={tagDraft}
                            onChange={(e) => setTagDraft(e.target.value)}
                            onKeyDown={onTagKey}
                            onBlur={() => tagDraft && addTag(tagDraft)}
                            placeholder={tags.length ? '' : 'Add a tag…'}
                            className="min-w-[6rem] flex-1 bg-transparent py-1 font-mono text-xs text-ink outline-none placeholder:text-muted-warm/60"
                        />
                    </div>
                    <p className="mt-2 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted-warm">
                        Press Enter or comma to add
                    </p>
                </div>
            </div>

            {/* Content: editor + preview */}
            <div className="mt-8">
                <div className="mb-3 flex items-center justify-between">
                    <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-warm">
                        Content — Markdown
                    </span>
                    {/* Mobile toggle (side-by-side on lg) */}
                    <div className="flex border border-line lg:hidden">
                        {(['write', 'preview'] as const).map((m) => (
                            <button
                                key={m}
                                type="button"
                                onClick={() => setMode(m)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.14em] transition-colors ${
                                    mode === m
                                        ? 'bg-moss text-cream'
                                        : 'text-muted-warm hover:text-moss'
                                }`}
                            >
                                {m === 'write' ? (
                                    <Pencil className="h-3 w-3" />
                                ) : (
                                    <Eye className="h-3 w-3" />
                                )}
                                {m}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid overflow-hidden border border-line lg:grid-cols-2 lg:divide-x lg:divide-line">
                    {/* Write */}
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        spellCheck={false}
                        className={`min-h-[28rem] w-full resize-y bg-cream p-6 font-mono text-sm leading-relaxed text-ink outline-none placeholder:text-muted-warm/60 ${
                            mode === 'preview' ? 'hidden lg:block' : 'block'
                        }`}
                    />
                    {/* Preview */}
                    <div
                        className={`min-h-[28rem] overflow-auto bg-ink/[0.015] p-6 ${
                            mode === 'write' ? 'hidden lg:block' : 'block'
                        }`}
                    >
                        <article className="prose prose-sm prose-stone max-w-none prose-headings:font-display prose-headings:tracking-tight prose-headings:text-ink prose-p:text-ink/80 prose-a:text-moss prose-a:no-underline hover:prose-a:underline prose-code:font-mono prose-code:text-ink prose-pre:bg-ink prose-pre:text-cream [&_pre_code]:text-cream [&_pre_code]:bg-transparent prose-strong:text-ink prose-blockquote:border-moss prose-blockquote:text-muted-warm">
                            <Markdown remarkPlugins={[remarkGfm]}>
                                {content || '*Nothing to preview yet.*'}
                            </Markdown>
                        </article>
                    </div>
                </div>
            </div>
        </section>
    )
}
