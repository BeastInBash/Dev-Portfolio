import { createFileRoute } from '@tanstack/react-router'
import { motion, useAnimationFrame, useMotionValue } from 'motion/react'
import type { Variants } from 'motion/react'
import { Instagram, Linkedin, Twitter } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ComponentType } from 'react'

export const Route = createFileRoute('/')({ component: Home })

const heroImg = '/assets/hero.png'

const WORDS = ['Builder.', 'Brewer.', 'Coder.']

/** Types each word in sequence, character by character, into stacked lines. */
function useTypewriter(words: string[], speed = 75, lineDelay = 400) {
    const [lines, setLines] = useState<string[]>(() => words.map(() => ''))
    const [active, setActive] = useState(0)
    const [done, setDone] = useState(false)

    useEffect(() => {
        let wi = 0
        let ci = 0
        let timeout: ReturnType<typeof setTimeout>

        const tick = () => {
            if (wi >= words.length) {
                setDone(true)
                return
            }
            ci += 1
            const word = words[wi]
            setActive(wi)
            setLines((prev) => {
                const next = [...prev]
                next[wi] = word.slice(0, ci)
                return next
            })
            if (ci >= word.length) {
                wi += 1
                ci = 0
                timeout = setTimeout(tick, lineDelay)
            } else {
                timeout = setTimeout(tick, speed)
            }
        }

        timeout = setTimeout(tick, lineDelay)
        return () => clearTimeout(timeout)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return { lines, active, done }
}

function Cursor() {
    return (
        <motion.span
            aria-hidden
            animate={{ opacity: [1, 1, 0, 0] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="ml-1 inline-block h-[0.78em] w-[0.06em] translate-y-[0.06em] bg-moss align-baseline"
        />
    )
}

const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}

const rise: Variants = {
    hidden: { y: 28, opacity: 0 },
    show: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
}

type Social = {
    name: string
    href: string
    Icon: ComponentType<{ className?: string; strokeWidth?: number }>
    /** elliptical orbit radii in px */
    rx: number
    ry: number
    /** angular velocity in deg/sec — sign sets direction */
    speed: number
    /** starting angle in degrees */
    phase: number
}

// Hand-tuned "random" orbits: varied radii, speeds and directions so the
// icons drift around the portrait without ever syncing up.
const SOCIALS: Social[] = [
    {
        name: 'LinkedIn',
        href: 'https://www.linkedin.com/in/saifdev',
        Icon: Linkedin,
        rx: 212,
        ry: 224,
        speed: 13,
        phase: 18,
    },
    {
        name: 'Twitter',
        href: 'https://twitter.com/saifdev',
        Icon: Twitter,
        rx: 238,
        ry: 198,
        speed: -16,
        phase: 137,
    },
    {
        name: 'Instagram',
        href: 'https://www.instagram.com/saifdev',
        Icon: Instagram,
        rx: 196,
        ry: 236,
        speed: 18,
        phase: 256,
    },
]

type Orbit = { rx: number; ry: number; speed: number; phase: number }

/** Drives an elliptical orbit via motion values; returns offsets + a pause setter. */
function useOrbit(o: Orbit) {
    const x = useMotionValue(Math.cos((o.phase * Math.PI) / 180) * o.rx)
    const y = useMotionValue(Math.sin((o.phase * Math.PI) / 180) * o.ry)
    const angle = useRef(o.phase)
    const paused = useRef(false)
    const setPaused = (v: boolean) => {
        paused.current = v
    }

    useAnimationFrame((_, delta) => {
        if (paused.current) return
        angle.current += (o.speed * delta) / 1000
        const rad = (angle.current * Math.PI) / 180
        x.set(Math.cos(rad) * o.rx)
        y.set(Math.sin(rad) * o.ry)
    })

    return { x, y, setPaused }
}

/** A clickable social icon revolving on its own orbit; pauses while hovered/focused. */
function OrbitIcon({ social }: { social: Social }) {
    const { x, y, setPaused } = useOrbit(social)
    const { Icon } = social

    return (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <motion.a
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.name}
                style={{ x, y }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
                onFocus={() => setPaused(true)}
                onBlur={() => setPaused(false)}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.95 }}
                className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-line bg-cream/85 text-ink/90 shadow-sm backdrop-blur-sm transition-colors hover:border-ink/30 hover:text-ink"
            >
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </motion.a>
        </div>
    )
}

/** Inline, single-path brand mark rendered in `currentColor` (monochrome charcoal). */
function brandIcon(path: string) {
    return function Brand({ className }: { className?: string }) {
        return (
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
                <path d={path} />
            </svg>
        )
    }
}

// Official Simple Icons path data — single-color, recolored via currentColor.
const ReactIcon = brandIcon(
    'M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z',
)
const NextIcon = brandIcon(
    'M18.665 21.978C16.758 23.255 14.465 24 12 24 5.377 24 0 18.623 0 12S5.377 0 12 0s12 5.377 12 12c0 3.583-1.574 6.801-4.067 9.001L9.219 7.2H7.2v9.596h1.615V9.251l9.85 12.727Zm-3.332-8.533 1.6 2.061V7.2h-1.6v6.245Z',
)
const ExpressIcon = brandIcon(
    'M24 18.588a1.529 1.529 0 01-1.895-.72l-3.45-4.771-.5-.667-4.003 5.444a1.466 1.466 0 01-1.802.708l5.158-6.92-4.798-6.251a1.595 1.595 0 011.9.666l3.576 4.83 3.596-4.81a1.435 1.435 0 011.788-.668L21.708 7.9l-2.522 3.283a.666.666 0 000 .994l4.804 6.412zM.002 11.576l.42-2.075c1.154-4.103 5.858-5.81 9.094-3.27 1.895 1.489 2.368 3.597 2.275 5.973H1.116C.943 16.447 4.005 19.009 7.92 17.7a4.078 4.078 0 002.582-2.876c.207-.666.548-.78 1.174-.588a5.417 5.417 0 01-2.589 3.957 6.272 6.272 0 01-7.306-.933 6.575 6.575 0 01-1.64-3.858c0-.235-.08-.455-.134-.666A88.33 88.33 0 010 11.577zm1.127-.286h9.654c-.06-3.076-2.001-5.258-4.59-5.278-2.882-.04-4.944 2.094-5.071 5.264z',
)
const NodeIcon = brandIcon(
    'M11.998,24c-0.321,0-0.641-0.084-0.922-0.247l-2.936-1.737c-0.438-0.245-0.224-0.332-0.08-0.383 c0.585-0.203,0.703-0.25,1.328-0.604c0.065-0.037,0.151-0.023,0.218,0.017l2.256,1.339c0.082,0.045,0.197,0.045,0.272,0l8.795-5.076 c0.082-0.047,0.134-0.141,0.134-0.238V6.921c0-0.099-0.053-0.192-0.137-0.242l-8.791-5.072c-0.081-0.047-0.189-0.047-0.271,0 L3.075,6.68C2.99,6.729,2.936,6.825,2.936,6.921v10.15c0,0.097,0.054,0.189,0.139,0.235l2.409,1.392 c1.307,0.654,2.108-0.116,2.108-0.89V7.787c0-0.142,0.114-0.253,0.256-0.253h1.115c0.139,0,0.255,0.112,0.255,0.253v10.021 c0,1.745-0.95,2.745-2.604,2.745c-0.508,0-0.909,0-2.026-0.551L2.28,18.675c-0.57-0.329-0.922-0.945-0.922-1.604V6.921 c0-0.659,0.353-1.275,0.922-1.603l8.795-5.082c0.557-0.315,1.296-0.315,1.848,0l8.794,5.082c0.57,0.329,0.924,0.944,0.924,1.603 v10.15c0,0.659-0.354,1.273-0.924,1.604l-8.794,5.078C12.643,23.916,12.324,24,11.998,24z M19.099,13.993 c0-1.9-1.284-2.406-3.987-2.763c-2.731-0.361-3.009-0.548-3.009-1.187c0-0.528,0.235-1.233,2.258-1.233 c1.807,0,2.473,0.389,2.747,1.607c0.024,0.115,0.129,0.199,0.247,0.199h1.141c0.071,0,0.138-0.031,0.186-0.081 c0.048-0.054,0.074-0.123,0.067-0.196c-0.177-2.098-1.571-3.076-4.388-3.076c-2.508,0-4.004,1.058-4.004,2.833 c0,1.925,1.488,2.457,3.895,2.695c2.88,0.282,3.103,0.703,3.103,1.269c0,0.983-0.789,1.402-2.642,1.402 c-2.327,0-2.839-0.584-3.011-1.742c-0.02-0.124-0.126-0.215-0.253-0.215h-1.137c-0.141,0-0.254,0.112-0.254,0.253 c0,1.482,0.806,3.248,4.655,3.248C17.501,17.007,19.099,15.91,19.099,13.993z',
)
const TypeScriptIcon = brandIcon(
    'M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z',
)
const JavaScriptIcon = brandIcon(
    'M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z',
)

type Tech = Orbit & {
    name: string
    Icon: ComponentType<{ className?: string }>
    /** asymmetric border-radius so the chip reads as an organic blob, not a circle */
    blob: string
}

// Tech-stack marks: decorative only (no links), each on its own random orbit + blob shape.
const TECH: Tech[] = [
    { name: 'React', Icon: ReactIcon, rx: 250, ry: 174, speed: -9, phase: 28, blob: '42% 58% 63% 37% / 49% 52% 48% 51%' },
    { name: 'Next.js', Icon: NextIcon, rx: 166, ry: 248, speed: 11, phase: 94, blob: '63% 37% 42% 58% / 38% 63% 37% 62%' },
    { name: 'Express', Icon: ExpressIcon, rx: 232, ry: 206, speed: -12, phase: 158, blob: '50% 50% 36% 64% / 55% 38% 62% 45%' },
    { name: 'Node.js', Icon: NodeIcon, rx: 154, ry: 198, speed: 8, phase: 214, blob: '38% 62% 55% 45% / 58% 42% 58% 42%' },
    { name: 'TypeScript', Icon: TypeScriptIcon, rx: 244, ry: 156, speed: 10, phase: 288, blob: '60% 40% 47% 53% / 41% 57% 43% 59%' },
    { name: 'JavaScript', Icon: JavaScriptIcon, rx: 180, ry: 236, speed: -13, phase: 338, blob: '45% 55% 52% 48% / 62% 44% 56% 38%' },
]

/** A non-clickable tech-stack chip revolving on its own orbit; pauses while hovered. */
function OrbitChip({ tech }: { tech: Tech }) {
    const { x, y, setPaused } = useOrbit(tech)
    const { Icon } = tech

    return (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <motion.div
                aria-hidden
                style={{ x, y, borderRadius: tech.blob }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
                whileHover={{ scale: 1.12 }}
                className="pointer-events-auto flex h-9 w-9 items-center justify-center border border-line bg-cream/80 text-ink/80 shadow-sm backdrop-blur-sm transition-colors hover:text-ink"
            >
                <Icon className="h-4 w-4" />
            </motion.div>
        </div>
    )
}

function Home() {
    const { lines, active, done } = useTypewriter(WORDS)
    const cursorLine = done ? WORDS.length - 1 : active

    // Orbiting icons are client-only (motion-value transforms differ from SSR),
    // so mount them after hydration to avoid a hydration mismatch.
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])

    return (
        <section id="top" className="mx-auto max-w-7xl px-6 pt-20 pb-24 lg:pt-28">
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16"
            >
                {/* Left: status + headline + subtext */}
                <div className="order-2 lg:order-1">
                    <motion.div
                        variants={rise}
                        className="mb-8 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.18em] text-ink/80"
                    >
                        <span className="relative flex h-2 w-2 items-center justify-center">
                            {[0, 1].map((i) => (
                                <motion.span
                                    key={i}
                                    aria-hidden
                                    className="absolute inset-0 rounded-full bg-moss"
                                    style={{ willChange: 'transform, opacity' }}
                                    initial={{ scale: 1, opacity: 0.5 }}
                                    animate={{ scale: 2.8, opacity: 0 }}
                                    transition={{
                                        duration: 2.4,
                                        repeat: Infinity,
                                        ease: 'easeOut',
                                        delay: i * 1.6,
                                    }}
                                />
                            ))}
                            <span className="relative h-2 w-2 rounded-full bg-moss" />
                        </span>
                        Full-stack developer — open to interesting conversations
                    </motion.div>

                    <h1 className="font-display font-bold leading-[0.9] tracking-tight text-ink text-6xl sm:text-7xl lg:text-8xl">
                        {WORDS.map((_, i) => (
                            <span
                                key={i}
                                className={`block ${i === WORDS.length - 1 ? 'text-moss' : ''}`}
                            >
                                {lines[i] || '​'}
                                {i === cursorLine && <Cursor />}
                            </span>
                        ))}
                    </h1>

                    <motion.p
                        variants={rise}
                        className="mt-8 max-w-md font-display text-lg leading-relaxed text-muted-warm"
                    >
                        I build fast, reliable web applications end-to-end — from API and
                        database to polished, responsive interfaces.
                    </motion.p>
                </div>

                {/* Right: portrait with orbiting socials */}
                <div className="order-1 lg:order-2">
                    <motion.div
                        variants={rise}
                        className="relative mx-auto w-full max-w-md"
                    >
                        <img
                            src={heroImg}
                            alt="Mohammad Saif"
                            className="w-full select-none object-contain"
                            draggable={false}
                        />
                        {mounted &&
                            SOCIALS.map((social) => (
                                <OrbitIcon key={social.name} social={social} />
                            ))}
                        {mounted &&
                            TECH.map((tech) => (
                                <OrbitChip key={tech.name} tech={tech} />
                            ))}
                    </motion.div>
                </div>
            </motion.div>
        </section>
    )
}
