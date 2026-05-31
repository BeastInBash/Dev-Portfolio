import {
    HeadContent,
    Outlet,
    Scripts,
    createRootRoute,
    useRouterState,
} from '@tanstack/react-router'
import { motion } from 'motion/react'

import appCss from '../styles.css?url'
import { Navbar } from '#/components/Navbar'

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
    return (
        <>
            <Navbar />
            {/* overflow-x-hidden clips the incoming page while it slides in */}
            <main className="min-h-screen overflow-x-hidden">
                <AnimatedOutlet />
            </main>
        </>
    )
}

function RootDocument({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <HeadContent />
            </head>
            <body className='max-h-screen overflow-y-hidden'>
                {children}
                <Scripts />
            </body>
        </html>
    )
}
