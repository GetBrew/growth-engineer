import { cn } from '@/lib/utils/cn'

/**
 * An icon file from /public drawn as a mask filled with the text color, so
 * a single-color SVG follows `text-*` (and hover states) like a Hugeicon.
 */
export function MaskIcon({
  src,
  size,
  className,
}: {
  src: string
  size: number
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'mask-contain mask-center mask-no-repeat block shrink-0 bg-current',
        className
      )}
      style={{
        width: size,
        height: size,
        maskImage: `url(${src})`,
        WebkitMaskImage: `url(${src})`,
      }}
    />
  )
}
