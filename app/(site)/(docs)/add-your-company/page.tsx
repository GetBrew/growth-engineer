import { GuidePage, guideMetadata } from '@/components/contribute/guide-page'

const SLUG = 'add-your-company'

export const metadata = guideMetadata(SLUG)

export default function Page() {
  return <GuidePage slug={SLUG} />
}
