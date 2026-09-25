import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'
import SiteNotFound from './(site)/not-found'

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />
      <main className="flex-1">
        <SiteNotFound />
      </main>
      <Footer />
    </div>
  )
}
