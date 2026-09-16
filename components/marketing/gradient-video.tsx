'use client'

import { useEffect, useRef, useState } from 'react'

const TRANSITION_INTERVAL_MS = 4000
const CROSSFADE_MS = 750
const PLAYBACK_RATE = 0.75

type VideoWithFrameCallback = HTMLVideoElement & {
  requestVideoFrameCallback?: (callback: () => void) => number
}

/**
 * The workflows hero: one short loop, crossfaded against a second copy of
 * itself so the seam never shows. Decorative, muted, and skipped by assistive
 * tech.
 */
export function GradientVideo() {
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([])
  const activeIndexRef = useRef(0)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const videos = videoRefs.current
    const [first, second] = videos
    if (!(first && second)) {
      return
    }

    let disposed = false
    let fadeTimer: ReturnType<typeof setTimeout> | undefined

    for (const video of videos) {
      if (video) {
        video.playbackRate = PLAYBACK_RATE
        video.currentTime = 0
      }
    }
    first.play().catch(() => undefined)

    const showNext = () => {
      const outgoingIndex = activeIndexRef.current
      const incomingIndex = outgoingIndex === 0 ? 1 : 0
      const outgoing = videos[outgoingIndex]
      const incoming = videos[incomingIndex] as VideoWithFrameCallback | null
      if (!(outgoing && incoming)) {
        return
      }
      incoming.currentTime = 0
      incoming.playbackRate = PLAYBACK_RATE
      const swap = () => {
        if (disposed) {
          return
        }
        activeIndexRef.current = incomingIndex
        setActiveIndex(incomingIndex)
        fadeTimer = setTimeout(() => {
          outgoing.pause()
          outgoing.currentTime = 0
        }, CROSSFADE_MS)
      }
      incoming
        .play()
        .then(() => {
          if (incoming.requestVideoFrameCallback) {
            incoming.requestVideoFrameCallback(swap)
          } else {
            requestAnimationFrame(swap)
          }
        })
        .catch(() => undefined)
    }

    const interval = setInterval(showNext, TRANSITION_INTERVAL_MS)
    return () => {
      disposed = true
      clearInterval(interval)
      if (fadeTimer) {
        clearTimeout(fadeTimer)
      }
      for (const video of videos) {
        video?.pause()
      }
    }
  }, [])

  return (
    <div aria-hidden="true" className="absolute inset-0 z-0">
      {[0, 1].map((index) => (
        <video
          autoPlay={index === 0}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-[750ms] ease-linear ${
            activeIndex === index ? 'opacity-100' : 'opacity-0'
          }`}
          key={index}
          loop
          muted
          playsInline
          preload="auto"
          ref={(element) => {
            videoRefs.current[index] = element
          }}
          tabIndex={-1}
        >
          <source src="/gradient.mp4" type="video/mp4" />
        </video>
      ))}
    </div>
  )
}
