import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { OG_SIZE } from '@/components/seo/og-card'

/**
 * The card's type: Geist 500 and 600 (SIL OFL, assets/fonts/geist), read
 * once per process. `next/og` bundles only the regular weight, and a title
 * needs weight. The read is SYNCHRONOUS for the same reason the catalog's
 * is: a value that resolves without real I/O keeps the image routes
 * prerenderable at build. Unknown keys answer 404 before this runs.
 */

type Font = {
  name: string
  data: Buffer
  weight: 500 | 600
  style: 'normal'
}

let cached: Array<Font> | null = null

function fonts(): Array<Font> {
  if (!cached) {
    const directory = join(process.cwd(), 'assets', 'fonts', 'geist')
    cached = ([500, 600] as const).map((weight) => ({
      name: 'Geist',
      data: readFileSync(join(directory, `Geist-${weight}.woff`)),
      weight,
      style: 'normal',
    }))
  }
  return cached
}

/** The `ImageResponse` options every card uses. */
export function ogOptions() {
  return { ...OG_SIZE, fonts: fonts() }
}
