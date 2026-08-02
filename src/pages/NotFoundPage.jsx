import { Link } from 'react-router-dom'
import { Heart, ArrowLeft } from 'lucide-react'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import SEO from '../components/SEO'

export default function NotFoundPage() {
  return (
    <div className="min-h-svh w-full bg-linen text-ink flex flex-col">
      <SEO
        title="Page Not Found | InviteMyPeople"
        description="The page you're looking for doesn't exist."
        path="/404"
        noindex
      />
      <SiteHeader />

      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
        <Heart className="w-8 h-8 text-rose" strokeWidth={1.2} />
        <h1 className="font-serif text-3xl sm:text-4xl text-ink">Page Not Found</h1>
        <p className="max-w-md text-ink-soft">
          We couldn&rsquo;t find the page you were looking for. It may have
          moved, or the link might be off.
        </p>
        <Link
          to="/"
          className="mt-2 inline-flex items-center gap-2 rounded-full bg-rose px-6 py-3 text-sm font-medium text-ivory shadow-card"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </main>

      <SiteFooter />
    </div>
  )
}
