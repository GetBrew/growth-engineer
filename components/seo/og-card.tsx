/**
 * The social card, drawn by `next/og` (satori) at build for every page that
 * has one: the root, each company, each tool, each workflow. Black canvas,
 * white title, gray facts, nothing else — the card says one thing. Satori
 * draws a subset of CSS (flex, inline styles, the fonts it is handed), so the
 * layout is flex only and text is clamped here: there is no `line-clamp`.
 */

export const OG_SIZE = { width: 1200, height: 630 } as const

export type OgKind = 'Site' | 'Company' | 'Tool' | 'Workflow'

const LABEL: Record<OgKind, string> = {
  Site: 'Catalog',
  Company: 'Company',
  Tool: 'Tool',
  Workflow: 'Workflow',
}

const WHITE = '#ffffff'
const GRAY = '#a1a1a1'
const DIM = '#666666'
const RULE = '#262626'

function clamp(text: string, max: number): string {
  if (text.length <= max) {
    return text
  }
  const cut = text.slice(0, max)
  const space = cut.lastIndexOf(' ')
  return `${cut.slice(0, space > max / 2 ? space : max).trimEnd()}…`
}

export function OgCard({
  kind,
  title,
  description,
  facts,
  path,
}: {
  kind: OgKind
  title: string
  description: string
  /** Short facts, drawn in a row: "by Clay", "MCP", "API". */
  facts: ReadonlyArray<string>
  /** The page's path, or the file's for a page that is one. */
  path: string
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        padding: '60px 72px 56px',
        background: '#000000',
        backgroundImage:
          'radial-gradient(circle at 0% 0%, rgba(255,255,255,0.09), rgba(0,0,0,0) 55%)',
        color: WHITE,
        fontFamily: 'Geist',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 26,
        }}
      >
        <div style={{ fontWeight: 500, letterSpacing: -0.5 }}>
          growth.engineer
        </div>
        <div style={{ color: DIM }}>{LABEL[kind]}</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div
          style={{
            fontSize: title.length > 36 ? 66 : 84,
            fontWeight: 600,
            lineHeight: 1.05,
            letterSpacing: -3,
          }}
        >
          {clamp(title, 68)}
        </div>
        <div
          style={{
            fontSize: 32,
            lineHeight: 1.4,
            color: GRAY,
            maxWidth: 980,
          }}
        >
          {clamp(description, 140)}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: `1px solid ${RULE}`,
          paddingTop: 28,
          fontSize: 24,
          color: DIM,
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 16,
            flex: 1,
            minWidth: 0,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
        >
          {facts.map((fact, index) => (
            <div key={fact} style={{ display: 'flex', gap: 16 }}>
              {index > 0 ? <div style={{ color: RULE }}>/</div> : null}
              <div>{fact}</div>
            </div>
          ))}
        </div>
        <div style={{ flexShrink: 0, marginLeft: 32, whiteSpace: 'nowrap' }}>
          {clamp(path, 44)}
        </div>
      </div>
    </div>
  )
}
