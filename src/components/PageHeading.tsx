/** Editorial page header: mono eyebrow with section number + display title + intro. */
export function PageHeading({
    index,
    label,
    title,
    intro,
}: {
    index: string
    label: string
    title: string
    intro: string
}) {
    return (
        <header className="mb-16 max-w-2xl">
            <p className="mb-6 font-mono text-xs uppercase tracking-[0.22em] text-muted-warm">
                {index} <span className="text-line">/</span> {label}
            </p>
            <h1 className="font-display text-5xl font-bold leading-[0.95] tracking-tight text-ink sm:text-6xl">
                {title}
            </h1>
            <p className="mt-6 font-display text-lg leading-relaxed text-muted-warm">
                {intro}
            </p>
        </header>
    )
}
