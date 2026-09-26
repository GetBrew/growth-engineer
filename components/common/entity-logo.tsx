import Image from 'next/image'
import { cn } from '@/lib/utils/cn'

export function EntityLogo({
  name,
  logoUrl,
  size = 44,
  className,
}: {
  name: string
  logoUrl?: string
  size?: number
  className?: string
}) {
  const src = logoUrl ?? null
  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center overflow-hidden rounded-xl border bg-background',
        className
      )}
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image
          alt=""
          className="size-full object-contain p-[18%]"
          height={size}
          src={src}
          width={size}
        />
      ) : (
        <span className="type-label text-soft">{name.charAt(0)}</span>
      )}
    </span>
  )
}
