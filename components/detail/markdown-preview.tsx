import type { ComponentProps } from 'react'
import Markdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'

/**
 * A rendered file, drawn as a page — ON THE SERVER, at build. The files are
 * static, so their HTML is too: no markdown parser ships to the browser, and
 * the preview is in the prerendered page before any script runs.
 *
 * react-markdown renders to React elements, never raw HTML: a contributor's
 * notes cannot inject markup, and `javascript:` links are dropped by its
 * default URL transform. The file's headings step down one level, because the
 * page already has an h1.
 */

const FRONTMATTER = /^---\n[\s\S]*?\n---\n+/
const EXTERNAL = /^https?:/

/** Drop react-markdown's `node` so it never reaches the DOM as an attribute. */
function bare<T extends { node?: unknown }>({
  node: _node,
  ...props
}: T): Omit<T, 'node'> {
  return props
}

function Anchor(props: ComponentProps<'a'> & { node?: unknown }) {
  const { href, children, ...rest } = bare(props)
  const isExternal = typeof href === 'string' && EXTERNAL.test(href)
  return (
    <a
      {...rest}
      className="wrap-anywhere font-medium text-foreground underline underline-offset-4"
      href={href}
      rel={isExternal ? 'noreferrer' : undefined}
      target={isExternal ? '_blank' : undefined}
    >
      {children}
    </a>
  )
}

const COMPONENTS: Components = {
  h1: (props) => <h2 {...bare(props)} />,
  h2: (props) => <h3 {...bare(props)} />,
  h3: (props) => <h4 {...bare(props)} />,
  h4: (props) => <h5 {...bare(props)} />,
  h5: (props) => <h6 {...bare(props)} />,
  a: Anchor,
  ul: (props) => <ul className="list-disc pl-5" {...bare(props)} />,
  ol: (props) => <ol className="list-decimal pl-5" {...bare(props)} />,
  li: (props) => <li className="py-0.5 pl-1" {...bare(props)} />,
  strong: (props) => (
    <strong className="font-medium text-foreground" {...bare(props)} />
  ),
  pre: (props) => (
    <pre
      className="my-3 overflow-x-auto rounded-xl border bg-surface p-4 font-mono text-[13px] leading-6 [&_code]:bg-transparent [&_code]:p-0"
      {...bare(props)}
    />
  ),
  code: (props) => (
    <code
      className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.875em]"
      {...bare(props)}
    />
  ),
}

export function MarkdownPreview({ markdown }: { markdown: string }) {
  return (
    <div className="type-body [&_h2]:type-item [&_h3]:type-subsection [&_h4]:type-control [&_table]:type-label [&_h2]:mt-0 [&_h2]:mb-2 [&_h3]:mt-7 [&_h3]:mb-2 [&_h4]:mt-5 [&_h4]:mb-1.5 [&_hr]:my-6 [&_p]:my-1.5">
      <Markdown components={COMPONENTS} remarkPlugins={[remarkGfm]}>
        {markdown.replace(FRONTMATTER, '')}
      </Markdown>
    </div>
  )
}
