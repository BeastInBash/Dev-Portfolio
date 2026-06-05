import { useState, type FormEvent } from 'react'
import { Lock, LoaderCircle } from 'lucide-react'
import { useAuth } from '#/lib/auth'

/**
 * Standalone login gate for /admin. Warm-editorial language to match the panel:
 * cream ground, hairline border, mono meta, moss accent on the submit action.
 */
export function AdminLogin() {
    const { login } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)

    async function onSubmit(e: FormEvent) {
        e.preventDefault()
        setError(null)
        setSubmitting(true)
        const res = await login(email.trim(), password)
        setSubmitting(false)
        if (!res.ok) setError(res.error ?? 'Login failed')
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-cream px-6">
            <div className="w-full max-w-sm">
                {/* eyebrow */}
                <div className="mb-8 flex items-center gap-3">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-moss/60" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-moss" />
                    </span>
                    <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-ink">
                        Admin
                        <span className="ml-2 text-rust">/ Console</span>
                    </span>
                </div>

                <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
                    Sign in
                </h1>
                <p className="mt-2 font-serif text-muted-warm">
                    This area is restricted. Enter your credentials to continue.
                </p>

                <form onSubmit={onSubmit} className="mt-8 space-y-5">
                    <div>
                        <label
                            htmlFor="email"
                            className="mb-1.5 block font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-warm"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="username"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-line bg-transparent px-3 py-2.5 font-serif text-ink outline-none transition-colors placeholder:text-muted-warm/60 focus:border-moss"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="mb-1.5 block font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-warm"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-line bg-transparent px-3 py-2.5 font-serif text-ink outline-none transition-colors placeholder:text-muted-warm/60 focus:border-moss"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <p className="font-mono text-xs text-rust" role="alert">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="group flex w-full items-center justify-center gap-2 bg-moss px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-cream transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {submitting ? (
                            <LoaderCircle className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
                        ) : (
                            <Lock className="h-3.5 w-3.5" strokeWidth={2} />
                        )}
                        {submitting ? 'Signing in…' : 'Sign in'}
                    </button>
                </form>
            </div>
        </div>
    )
}
