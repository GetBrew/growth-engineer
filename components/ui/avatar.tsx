import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils/cn'

/*
 * A static avatar: the image is in the HTML from the first byte, painted over
 * its fallback. No client code and no "loading → loaded" swap — the fallback
 * only ever shows if the image fails (an empty-alt image that fails paints
 * nothing, so the letter beneath shows through). The image takes the avatar's
 * background so a transparent logo (a wordmark with gaps) still covers the
 * letter instead of printing over it.
 */

function Avatar({
  className,
  size = 'default',
  ...props
}: ComponentProps<'span'> & {
  size?: 'default' | 'sm' | 'lg'
}) {
  return (
    <span
      className={cn(
        'group/avatar relative isolate flex size-8 shrink-0 select-none rounded-full after:absolute after:inset-0 after:z-20 after:rounded-full after:border after:border-border after:mix-blend-darken data-[size=lg]:size-10 data-[size=sm]:size-6 dark:after:mix-blend-lighten',
        className
      )}
      data-size={size}
      data-slot="avatar"
      {...props}
    />
  )
}

function AvatarImage({
  className,
  alt = '',
  src,
  ...props
}: ComponentProps<'img'>) {
  if (!src) {
    return null
  }
  return (
    // biome-ignore lint/performance/noImgElement: a static <img> is the point — no optimizer, no client swap
    <img
      alt={alt}
      className={cn(
        'absolute inset-0 z-10 aspect-square size-full rounded-full bg-inherit object-cover',
        className
      )}
      data-slot="avatar-image"
      decoding="async"
      // CSS sets the drawn size; these are the source's, for layout.
      height={96}
      src={src}
      width={96}
      {...props}
    />
  )
}

function AvatarFallback({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        'type-control group-data-[size=sm]/avatar:type-label flex size-full items-center justify-center rounded-full bg-muted text-muted-foreground',
        className
      )}
      data-slot="avatar-fallback"
      {...props}
    />
  )
}

export { Avatar, AvatarFallback, AvatarImage }
