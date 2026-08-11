// Co-branding header/footer for the white-label partner invite viewer (see
// PartnerInviteViewerPage.jsx) — a self-contained wrapper, NOT a change to
// any B2C template component. Renders the approved partner's logo,
// business name, and address around whatever invite content is passed as
// `children`.
export default function PartnerBrandBadge({ partner, children }) {
  return (
    <div className="min-h-svh w-full bg-linen text-ink">
      <header className="flex items-center justify-center gap-3 border-b border-champagne-deep/40 bg-ivory/80 px-6 py-3 text-center backdrop-blur-xl">
        {partner.logoUrl && (
          <img src={partner.logoUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
        )}
        <p className="text-xs uppercase tracking-[0.15em] text-ink-soft">
          Curated exclusively by <span className="font-semibold text-ink">{partner.businessName}</span>
        </p>
      </header>

      {children}

      <footer className="border-t border-champagne-deep/40 bg-ivory/80 px-6 py-4 text-center text-xs text-ink-soft">
        <p className="font-medium text-ink">{partner.businessName}</p>
        {partner.address && <p className="mt-0.5">{partner.address}</p>}
      </footer>
    </div>
  )
}
