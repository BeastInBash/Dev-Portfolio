import {
    HeadContent,
    Outlet,
    Scripts,
    createRootRoute,
    useRouterState,
} from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useEffect } from 'react'

import appCss from '../styles.css?url'
import { Navbar } from '#/components/Navbar'
import { apiFetch } from '#/lib/api'

export const Route = createRootRoute({
    head: () => ({
        meta: [
            {
                charSet: 'utf-8',
            },
            {
                name: 'viewport',
                content: 'width=device-width, initial-scale=1',
            },
            {
                title: 'Mohammad Saif',
            },
        ],
        links: [
            {
                rel: 'stylesheet',
                href: appCss,
            },
            {
                rel: 'icon',
                type: 'image/png',
                href: '/assets/favicon.png',
            },
        ],
    }),
    component: RootComponent,
    shellComponent: RootDocument,
})

/** Re-keyed per route so each page slides in from the right edge to center. */
function AnimatedOutlet() {
    const pathname = useRouterState({ select: (s) => s.location.pathname })

    return (
        <motion.div
            key={pathname}
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
            <Outlet />
        </motion.div>
    )
}

function RootComponent() {
    // The admin panel renders its own chrome (see routes/admin/route.tsx), so the
    // public Navbar is suppressed for any /admin path.
    const isAdmin = useRouterState({
        select: (s) => s.location.pathname.startsWith('/admin'),
    })

    // Count one visit per browser session (sessionStorage guard), excluding the
    // admin panel so editing sessions don't inflate the numbers. The backend
    // dedups unique visitors via the persistent `vid` cookie.
    useEffect(() => {
        if (isAdmin) return
        if (sessionStorage.getItem('visit-counted')) return
        sessionStorage.setItem('visit-counted', '1')
        apiFetch('/analytics/visit', { method: 'POST' }).catch(() => {})
    }, [isAdmin])

    return (
        // Fixed-height shell: navbar stays pinned, <main> is the scroll region so
        // long pages (e.g. the blog list) scroll while short pages don't overflow.
        <div className="flex h-screen flex-col">
            {!isAdmin && <Navbar />}
            {/* overflow-x-hidden clips the incoming page while it slides in;
                overflow-y-auto lets content taller than the viewport scroll. */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto">
                <AnimatedOutlet />
            </main>
        </div>
    )
}

function RootDocument({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <HeadContent />
            </head>
            <body className="h-screen overflow-hidden">
                {children}
                <Scripts />
            </body>
        </html>
    )
}
