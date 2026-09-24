import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function NewsletterForm() {
  return (
    <div className="w-full max-w-sm">
      <label className="type-label text-soft" htmlFor="newsletter-email">
        Stay updated
      </label>

      <div className="mt-3 flex items-center gap-2">
        <Input
          autoComplete="email"
          className="min-w-0 flex-1"
          id="newsletter-email"
          name="email"
          placeholder="you@company.com"
          type="email"
        />
        <Button size="pill" type="button">
          Subscribe
        </Button>
      </div>
    </div>
  )
}
