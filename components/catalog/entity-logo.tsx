import Image from 'next/image'
import { contextLogoUrl, isRemoteLogo } from '@/lib/logos'
import { cn } from '@/lib/utils/cn'

/**
 * A company's mark, or its initial when it has none. In between: a company
 * with a domain but no stored mark gets one built from the domain, which is
 * how a listing added before the logo job runs still looks finished. Remote
 * logos are served unoptimized (context.dev already serves the right size);
 * local ones go through the image pipeline.
 */
export function EntityLogo({
  name,
  logoUrl,
  domain,
  size = 44,
  className,
}: {
  name: string
  logoUrl?: string
  domain?: string
  size?: number
  className?: string
}) {
  const src = logoUrl ?? (domain ? contextLogoUrl(domain) : null)
  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-white',
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
          unoptimized={isRemoteLogo(src)}
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
