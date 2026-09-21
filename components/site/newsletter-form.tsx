import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

/**
 * The footer's signup. The field and button are real; nothing is sent yet —
 * there is no subscribe endpoint, so `action` stays off until there is one.
 */
export function NewsletterForm() {
  return (
    <form>
      <FieldGroup>
        <Field>
          <FieldLabel className="sr-only" htmlFor="newsletter-email">
            Email address
          </FieldLabel>
          <div className="flex items-center gap-2">
            <Input
              autoComplete="email"
              className="min-w-0 flex-1"
              controlSize="lg"
              id="newsletter-email"
              name="email"
              placeholder="you@company.com"
              required
              type="email"
            />
            <Button className="shrink-0" size="pill" type="submit">
              Subscribe
            </Button>
          </div>
        </Field>
      </FieldGroup>
    </form>
  )
}
