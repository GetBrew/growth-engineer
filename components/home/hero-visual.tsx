'use client'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils/cn'

const HERO_SLIDES = [
  { src: '/home/hero2.jpg', alt: 'A mountain path at sunrise' },
  { src: '/home/hero3.jpg', alt: 'A coastal village at sunset' },
  { src: '/home/hero5.jpg', alt: 'A lighthouse above the coast at sunset' },
] as const

/** One line per slide, and all of them true: what the catalog is. */
const CAPTIONS = [
  'One markdown file per tool and workflow.',
  'Copy it into any agent; the setup and the rules are inside.',
  'Open source: add your company by pull request.',
] as const

export function HeroVisual() {
  const [activeImage, setActiveImage] = useState(0)
  // Auto-advance stops the moment the reader chooses a slide, and never
  // starts for readers who asked for reduced motion.
  const [isPaused, setIsPaused] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const mediaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (
      isPaused ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }
    const timer = window.setInterval(() => {
      setActiveImage((current) => (current + 1) % HERO_SLIDES.length)
    }, 5000)

    return () => window.clearInterval(timer)
  }, [isPaused])

  useEffect(() => {
    const hero = heroRef.current
    const media = mediaRef.current

    if (!(hero && media)) {
      return
    }

    gsap.registerPlugin(ScrollTrigger)
    const mediaQuery = gsap.matchMedia()

    mediaQuery.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(
        media,
        { scale: 1.08, yPercent: -4 },
        {
          ease: 'none',
          force3D: true,
          scale: 1.03,
          scrollTrigger: {
            trigger: hero,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.8,
          },
          yPercent: 4,
        }
      )
    })

    return () => mediaQuery.revert()
  }, [])

  return (
    <div
      className="relative h-88 overflow-hidden rounded-3xl sm:h-104 lg:h-[clamp(18rem,calc(100svh-27rem),36rem)]"
      ref={heroRef}
    >
      <div className="absolute inset-0 will-change-transform" ref={mediaRef}>
        {HERO_SLIDES.map((slide, index) => (
          <Image
            alt={slide.alt}
            className={cn(
              'object-cover transition-opacity duration-1000 ease-out',
              index === activeImage ? 'opacity-100' : 'opacity-0'
            )}
            fill
            key={slide.src}
            priority={index === 0}
            sizes="(min-width: 1024px) calc(100vw - 8rem), (min-width: 640px) calc(100vw - 4rem), calc(100vw - 2rem)"
            src={slide.src}
          />
        ))}
      </div>

      <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/10 to-transparent" />

      <div className="absolute right-6 bottom-6 left-6 flex flex-col gap-6 text-white sm:right-8 sm:bottom-8 sm:left-8 sm:flex-row sm:items-end sm:justify-between">
        <p className="type-section max-w-xl text-balance">
          {CAPTIONS[activeImage] ?? CAPTIONS[0]}
        </p>

        <div className="flex items-center gap-2.5">
          <span className="type-item">growth.engineer</span>
        </div>
      </div>

      <div className="absolute top-1/2 right-6 flex -translate-y-1/2 flex-col items-center gap-2 sm:right-8">
        {HERO_SLIDES.map((slide, index) => (
          <button
            aria-label={`Show hero image ${index + 1}`}
            className={cn(
              'rounded-full bg-white/55 transition-all hover:bg-white',
              index === activeImage ? 'h-6 w-1.5 bg-white' : 'size-1.5'
            )}
            key={slide.src}
            onClick={() => {
              setIsPaused(true)
              setActiveImage(index)
            }}
            type="button"
          />
        ))}
      </div>
    </div>
  )
}
