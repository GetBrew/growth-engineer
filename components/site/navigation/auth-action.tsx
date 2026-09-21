import { Show, SignInButton, SignOutButton } from '@clerk/nextjs'
import { buttonVariants } from '@/components/ui/button'

export function AuthAction({ onClick }: { onClick?: () => void }) {
  const className = buttonVariants({ variant: 'outline', size: 'pill' })

  return (
    <Show
      fallback={
        <SignInButton mode="modal">
          <button className={className} onClick={onClick} type="button">
            Log in
          </button>
        </SignInButton>
      }
      when="signed-in"
    >
      <SignOutButton>
        <button className={className} onClick={onClick} type="button">
          Sign out
        </button>
      </SignOutButton>
    </Show>
  )
}
