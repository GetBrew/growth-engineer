import { MaskIcon } from '@/components/layout/mask-icon'
import { repoFileUrl } from '@/lib/github'

/** Where the parts no source file states come from. */
const RENDERER = 'lib/catalog/render-markdown.ts'
const SETUP = 'lib/catalog/render-access.ts'

const LINK =
  'focus-ring inline-flex min-w-0 items-center gap-1.5 rounded-sm text-soft underline-offset-4 transition-colors hover:text-foreground hover:underline'

/**
 * The source files a rendered file was built from, each linked to GitHub —
 * the entry's own file first, then every tool and company file (where the
 * ways in live) whose facts it prints (`CatalogDocument.sources`, computed at
 * build). The file above is never stored in the repository; these are, and
 * editing one changes it.
 */
export function BuiltFrom({ sources }: { sources: ReadonlyArray<string> }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-dashed px-4 py-3">
      <p className="type-label text-faint">
        Built from these files in the repository
      </p>
      <ul className="flex flex-col gap-1.5">
        {sources.map((path) => (
          <li className="flex min-w-0" key={path}>
            <a
              className={`${LINK} type-label font-mono`}
              href={repoFileUrl(path)}
              rel="noreferrer"
              target="_blank"
            >
              <MaskIcon size={12} src="/social/github.svg" />
              <span className="truncate">{path}</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="type-label text-faint">
        The layout and the rules come from <CodeLink path={RENDERER} />, the
        set-up wording from <CodeLink path={SETUP} />.
      </p>
    </div>
  )
}

function CodeLink({ path }: { path: string }) {
  return (
    <a
      className={`${LINK} font-mono`}
      href={repoFileUrl(path)}
      rel="noreferrer"
      target="_blank"
    >
      {path}
    </a>
  )
}
