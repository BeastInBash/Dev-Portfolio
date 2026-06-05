import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import {
    ArrowUpRight,
    LayoutDashboard,
    LoaderCircle,
    LogOut,
    PenLine,
} from 'lucide-react'
import { AuthProvider, useAuth } from '#/lib/auth'
import { AdminLogin } from '#/components/AdminLogin'

export const Route = createFileRoute('/admin')({ component: AdminRoute })

const avatar = '/assets/hero.png'

const tabs = [
    { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'New Post', to: '/admin/editor', icon: PenLine, exact: false },
] as const

/**
 * Auth boundary for the whole /admin subtree. The token lives in an httpOnly
 * cookie, so we ask the backend (/auth/me) on mount: while that resolves we
 * show nothing protected; guests get the login screen; only once authed does
 * the panel chrome + <Outlet/> render.
 */
function AdminRoute() {
    return (
        <AuthProvider>
            <AdminGate />
        </AuthProvider>
    )
}

function AdminGate() {
    const { status } = useAuth()

    if (status === 'loading') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-cream">
                <LoaderCircle
                    className="h-6 w-6 animate-spin text-moss"
                    strokeWidth={2}
                />
            </div>
        )
    }

    if (status === 'guest') {
        return <AdminLogin />
    }

    return <AdminLayout />
}

/**
 * Admin chrome: its own sticky top bar (the public Navbar is suppressed for
 * /admin in __root). Same warm-editorial language as the rest of the site —
 * hairline borders, mono meta, moss accent on the active tab.
 */
function AdminLayout() {
    const { logout } = useAuth()
    return (
        <div className="min-h-full bg-cream">
            <header className="sticky top-0 z-40 border-b border-line/70 bg-cream/80 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-6">
                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-moss/60" />
                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-moss" />
                        </span>
                        <img
                            src={avatar}
                            alt="Mohammad Saif"
                            className="h-8 w-8 rounded-full object-cover ring-1 ring-line"
                        />
                        <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-ink">
                            Admin
                            <span className="ml-2 text-rust">/ Console</span>
                        </span>
                    </div>

                    {/* Tabs */}
                    <nav className="flex items-center gap-1">
                        {tabs.map((t) => (
                            <Link
                                key={t.to}
                                to={t.to}
                                activeOptions={t.exact ? { exact: true } : undefined}
                                className="group flex items-center gap-2 border border-transparent px-3 py-2 font-mono text-xs uppercase tracking-[0.16em] text-ink/60 transition-colors hover:text-moss data-[status=active]:border-moss/40 data-[status=active]:bg-moss/[0.08] data-[status=active]:text-moss"
                            >
                                <t.icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                                <span className="hidden sm:inline">{t.label}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* Exit to site + logout */}
                    <div className="flex items-center gap-4">
                        <Link
                            to="/"
                            className="group inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.16em] text-muted-warm transition-colors hover:text-ink"
                        >
                            <span className="hidden sm:inline">View site</span>
                            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </Link>
                        <button
                            type="button"
                            onClick={() => void logout()}
                            className="group inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.16em] text-muted-warm transition-colors hover:text-rust"
                        >
                            <span className="hidden sm:inline">Logout</span>
                            <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
                        </button>
                    </div>
                </div>
            </header>

            <Outlet />
        </div>
    )
}
