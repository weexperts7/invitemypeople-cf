import { ChevronLeft, ChevronRight } from 'lucide-react'

// Shared Prev/Next pager for the Partner Portal's list screens
// (PartnerInvitesPage.jsx, PartnerOverviewPage.jsx's Recent Invites, and
// the admin's AdminPartnersPage.jsx). Client-side only — every list it
// paginates is already fetched in one request (listMyInvites caps at 200,
// adminListPartners has no realistic volume yet), so this just slices an
// already-loaded array rather than adding real offset/limit params to the
// API. Renders nothing when everything fits on one page.
export default function Pagination({ page, pageCount, onChange }) {
  if (pageCount <= 1) return null

  return (
    <div className="mt-4 flex items-center justify-center gap-3">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="inline-flex items-center gap-1.5 rounded-full border border-champagne-deep/50 bg-ivory/70 px-4 py-2 text-sm text-ink hover:bg-ivory disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Previous
      </button>
      <span className="text-sm text-ink-soft">
        Page {page} of {pageCount}
      </span>
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= pageCount}
        className="inline-flex items-center gap-1.5 rounded-full border border-champagne-deep/50 bg-ivory/70 px-4 py-2 text-sm text-ink hover:bg-ivory disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
