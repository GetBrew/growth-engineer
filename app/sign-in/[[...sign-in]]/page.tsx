import { SignIn } from '@clerk/nextjs'
import { AuthCard } from '@/components/auth-card'

/**
 * The `[[...sign-in]]` optional catch-all is required: Clerk appends its own
 * sub-paths (factor-one, sso-callback), and a plain `/sign-in` route 404s on
 * every one of them.
 *
 * See `AuthCard` for why the Suspense boundary inside it is load-bearing.
 */
export default function SignInPage() {
  return (
    <AuthCard>
      <SignIn />
    </AuthCard>
  )
}
