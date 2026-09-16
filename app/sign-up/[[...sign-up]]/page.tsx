import { SignUp } from '@clerk/nextjs'
import { AuthCard } from '@/components/auth-card'

/** See the sign-in page and `AuthCard`. */
export default function SignUpPage() {
  return (
    <AuthCard>
      <SignUp />
    </AuthCard>
  )
}
