import { cn } from '@/lib/utils/cn'

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
