'use client'

import dynamic from 'next/dynamic'

export const LazyToaster = dynamic(
  () => import('@/components/ui/toast').then((module) => module.Toaster),
  { ssr: false }
)
