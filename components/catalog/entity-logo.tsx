import Image from 'next/image'
import { isRemoteLogo } from '@/lib/logos'
import { cn } from '@/lib/utils/cn'

/**
 * A company's mark, or its initial when it has none. Remote logos are served
 * unoptimized (context.dev already serves the right size); local ones go
 * through the image pipeline.
 */
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
  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-white',
        className
      )}
      style={{ width: size, height: size }}
    >
      {logoUrl ? (
        <Image
          alt=""
          className="size-full object-contain p-[18%]"
          height={size}
          src={logoUrl}
          unoptimized={isRemoteLogo(logoUrl)}
          width={size}
        />
      ) : (
        <span className="font-medium text-foreground/70 text-xs">
          {name.charAt(0)}
        </span>
      )}
    </span>
  )
}
