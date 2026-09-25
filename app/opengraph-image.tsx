import { ImageResponse } from 'next/og'
import { OG_SIZE, OgCard } from '@/components/seo/og-card'
import { SITE } from '@/lib/catalog/definitions'
import { ogOptions } from '@/lib/seo/og-font'

/** The site's card: every page without a card of its own shares it. */
export const alt = SITE.tagline
export const size = OG_SIZE
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    <OgCard
      description={SITE.tagline}
      facts={['Companies', 'Tools', 'Workflows']}
      kind="Site"
      path="/llms.txt"
      title={SITE.name}
    />,
    ogOptions()
  )
}
