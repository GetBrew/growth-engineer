import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="font-semibold text-2xl">Page not found</h1>
      <p className="text-muted-foreground text-sm">
        The page you were looking for does not exist.
      </p>
      <Link className={cn(buttonVariants({ variant: 'outline' }))} href="/">
        Back home
      </Link>
    </main>
  )
}
