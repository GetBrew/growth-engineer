import { GuidePage, guideMetadata } from '@/components/contribute/guide-page'

const SLUG = 'add-a-workflow'

export const metadata = guideMetadata(SLUG)

export default function Page() {
  return <GuidePage slug={SLUG} />
}
