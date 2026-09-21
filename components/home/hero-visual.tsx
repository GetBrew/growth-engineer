'use client'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils/cn'

//
const HERO_SLIDES = [
  {
    src: '/home/hero2.png',
    alt: 'A mountain path at sunrise',
    quote:
      'I found the right workflow in minutes and handed it straight to my agent.',
    name: 'Thomas Park',
    role: 'Growth operator',
    avatar: '/one.svg',
  },
  {
    src: '/home/hero3.png',
    alt: 'A coastal village at sunset',
    quote:
      'The steps are clear enough to run today, without another week of research.',
    name: 'Philip Sorensen',
    role: 'Founder',
    avatar: '/two.svg',
  },
  {
    src: '/home/hero5.png',
    alt: 'A lighthouse above the coast at sunset',
    quote:
      'growth.engineer turned our scattered tools into a repeatable growth system.',
    name: 'Jessica W',
    role: 'Marketing lead',
    avatar: '/three.svg',
  },
] as const
//
export function HeroVisual() {
  const [activeImage, setActiveImage] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)
  const mediaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveImage((current) => (current + 1) % HERO_SLIDES.length)
    }, 5000)

    return () => window.clearInterval(timer)
  }, [])

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

  const activeSlide = HERO_SLIDES[activeImage] ?? HERO_SLIDES[0]

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
        <div className="max-w-xl">
          <p className="type-section text-balance">“{activeSlide.quote}”</p>
          <div className="mt-4 flex items-center gap-3">
            <Avatar size="lg">
              <AvatarImage alt={activeSlide.name} src={activeSlide.avatar} />
              <AvatarFallback>{activeSlide.name.slice(0, 1)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="type-subsection">{activeSlide.name}</p>
              <p className="type-label text-white/70">{activeSlide.role}</p>
            </div>
          </div>
        </div>

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
            onClick={() => setActiveImage(index)}
            type="button"
          />
        ))}
      </div>
    </div>
  )
}
