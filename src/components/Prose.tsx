import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeHighlight from 'rehype-highlight'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

// Shared markdown renderer for the public blog post AND the admin editor preview,
// so both stay in lockstep (same plugins, same code-block chrome). GFM tables/etc.
// via remark-gfm; rehype-raw lets trusted author HTML through (e.g. <u> underline
// from the editor shortcut); rehype-highlight tokenizes fenced code (.hljs-* spans,
// coloured in styles.css).
const remarkPlugins = [remarkGfm]
const rehypePlugins = [rehypeRaw, rehypeHighlight]

// A fenced code block rendered as a little terminal window — mac traffic lights
// (recoloured to the gruvbox accents) + a `›_ lang` prompt chip, on the ink panel.
function TerminalPre({ children, ...props }: ComponentPropsWithoutRef<'pre'>) {
    const code = Array.isArray(children) ? children[0] : children
    const className: string =
        (code as { props?: { className?: string } } | undefined)?.props
            ?.className ?? ''
    const lang = /language-(\w+)/.exec(className)?.[1] ?? 'code'

    return (
        <div className="not-prose my-6 overflow-hidden rounded-md border border-cream/10 bg-ink shadow-sm">
            {/* title bar */}
            <div className="flex items-center gap-2 border-b border-cream/10 bg-cream/[0.03] px-4 py-2.5">
                <span className="h-3 w-3 rounded-full bg-rust/90" />
                <span className="h-3 w-3 rounded-full bg-amber-400/90" />
                <span className="h-3 w-3 rounded-full bg-moss/90" />
                <span className="ml-2 inline-flex items-center gap-1.5 rounded border border-cream/10 px-2 py-0.5 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-cream/55">
                    <span className="text-moss">›_</span>
                    {lang}
                </span>
            </div>
            <pre
                {...props}
                className="overflow-x-auto p-4 font-mono text-[0.82rem] leading-relaxed text-cream"
            >
                {children}
            </pre>
        </div>
    )
}

const components = { pre: TerminalPre }

const BASE =
    'prose prose-stone max-w-none ' +
    'prose-headings:font-display prose-headings:tracking-tight prose-headings:text-ink ' +
    'prose-p:text-ink/80 ' +
    'prose-a:text-moss prose-a:no-underline hover:prose-a:underline ' +
    'prose-code:font-mono prose-code:text-ink ' +
    'prose-strong:text-ink ' +
    'prose-blockquote:border-moss prose-blockquote:text-muted-warm ' +
    'prose-img:rounded-sm'

export function Prose({
    children,
    className = '',
}: {
    children: string
    className?: string
}): ReactNode {
    return (
        <div className={`${BASE} ${className}`}>
            <Markdown
                remarkPlugins={remarkPlugins}
                rehypePlugins={rehypePlugins}
                components={components}
            >
                {children}
            </Markdown>
        </div>
    )
}
