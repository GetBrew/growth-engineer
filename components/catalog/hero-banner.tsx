import Image from 'next/image'
import type { ReactNode } from 'react'
import { GradientVideo } from '@/components/marketing/gradient-video'
import { MaskIcon } from '@/components/site/mask-icon'

export function HeroBanner({
  title,
  eyebrow,
  description,
  icon,
  children,
}: {
  title: string
  eyebrow: string
  description: string
  icon: string
  children?: ReactNode
}) {
  return (
    <section className="page-container pt-8 sm:pt-12">
      <div className="relative isolate flex min-h-[420px] items-center justify-center overflow-hidden rounded-[22px] bg-[#d98243] px-6 py-10 text-center sm:aspect-[16/7] sm:min-h-[360px] sm:rounded-[28px] sm:px-10 lg:aspect-[160/49] lg:min-h-[320px] lg:px-14">
        <GradientVideo />
        <div className="absolute inset-0 bg-black/5" />

        <div className="pointer-events-none relative z-10 flex w-full max-w-3xl flex-col items-center">
          <a
            className="glass-chip focus-ring type-label pointer-events-auto flex h-9 items-center gap-1.5 rounded-full px-3.5 text-soft transition-colors hover:bg-background/90 hover:text-foreground"
            href="https://brew.new"
            rel="noreferrer"
            target="_blank"
          >
            Brought to you by
            <span className="relative block h-4 w-12">
              <Image
                alt="Brew"
                className="object-contain"
                fill
                sizes="48px"
                src="/logos/brew.svg"
              />
            </span>
          </a>

          <div className="type-label mt-5 flex items-center gap-2 text-white/80">
            <MaskIcon size={17} src={icon} />
            {eyebrow}
          </div>
          <h1 className="type-display mt-3 max-w-[18ch] text-balance text-white">
            {title}
          </h1>
          <p className="type-lead mt-3 max-w-[38rem] text-pretty text-white/85">
            {description}
          </p>
          {children}
        </div>
      </div>
    </section>
  )
}
