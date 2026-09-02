import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  Calendar,
  Camera,
  CalendarPlus,
  Check,
  Clock,
  Copy,
  ExternalLink,
  Link as LinkIcon,
  Loader2,
  Film,
  Mail,
  MapPin,
  MessageSquareText,
  Music2,
  Phone,
  Search,
  Sparkles,
  Users,
  Wand2,
  X,
} from 'lucide-react'
import SEO from '../../components/SEO'
import AdminForbidden from '../../components/admin/AdminForbidden'
import PhotoUploader from '../../components/builder/PhotoUploader'
import EventsListEditor from '../../components/builder/EventsListEditor'
import SongSearchPicker from '../../components/builder/SongSearchPicker'
import { usePartnerAuth } from '../../hooks/usePartnerAuth'
import { adminGetMe, adminListPartners, adminCreateInvite, adminUploadMahoganyVideo } from '../../utils/partnerApi'
import { TEMPLATES } from '../../data/templatesData'
import { slugify } from '../../utils/slugify'
import { MAX_VIDEO_BYTES, ALLOWED_VIDEO_MIME_TYPES } from '../../utils/videoUpload'

const SLUG_FORMAT_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const EMPTY_FORM = {
  names: '',
  // Only used for a template whose bespoke layout needs the couple's two
  // names kept separate (see `needsSplitNames` below) — combined into
  // `names` as "A & B" at submit time either way, so the saved invite
  // always has the one format every layout's own name-splitting logic
  // (MahoganySealAdapter.jsx, RoyalPlumCurtainAdapter.jsx) expects.
  partner1Name: '',
  partner2Name: '',
  eventTitle: '',
  date: '',
  time: '',
  venue: '',
  locationUrl: '',
  greetingLine: '',
  message: '',
  // "Family Details" — optional, rendered as two cards under the couple's
  // names (see WelcomeSplash.jsx's couple.people).
  groomName: '',
  groomParents: '',
  brideName: '',
  brideParents: '',
  // Partner branch only — the CLIENT's own contact details, same fields
  // PartnerCreateInvitePage.jsx collects. Required: this is where the
  // invitation-ready email (live link + private dashboard link) is sent.
  clientEmail: '',
  clientPhone: '',
  // Direct branch only — the HOST's own contact details, same fields
  // CreateInvitePage.jsx collects as "Your Name/Email/Phone". Required for
  // the same reason: the order-confirmation email goes here.
  hostName: '',
  hostEmail: '',
  hostPhone: '',
  // Mahogany Seal only (`restrictedFields`) — see
  // MahoganySealAdapter.jsx's own comment on why this is admin-entered
  // rather than derived from the couple's names.
  hashtag: '',
}

function randomSlugSuffix() {
  return Math.random().toString(36).slice(2, 8)
}

// Shown once, right after a successful mint — a modal (not an inline panel,
// unlike CreateInvitePage.jsx/PartnerCreateInvitePage.jsx's own success
// steps) per this feature's own spec, since this page never navigates away
// from the form itself: "Create Another" just clears it in place.
function SuccessModal({ result, onCopy, copied, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-lg rounded-3xl border border-white/60 bg-ivory p-6 shadow-card sm:p-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-champagne-deep/50 text-ink-soft hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blush">
          <Check className="h-6 w-6 text-rose" strokeWidth={2} />
        </div>
        <h2 className="text-center font-serif text-2xl text-ink">Invite Is Live!</h2>
        <p className="mt-2 text-center text-sm text-ink-soft">
          No payment collected{result.destination === 'partner' ? ' and no credit spent' : ''} — this was
          generated as an admin override. We&rsquo;ve emailed the{' '}
          {result.destination === 'partner' ? 'client' : 'host'} their live link and private dashboard link.
        </p>

        <div className="mt-6 rounded-xl border border-champagne-deep/50 bg-ivory/80 p-4 text-left">
          <p className="mb-1.5 text-xs uppercase tracking-[0.2em] text-ink-soft">Live URL</p>
          <div className="flex items-center gap-2">
            <span className="min-w-0 flex-1 truncate text-sm text-ink">{result.url}</span>
            <button
              type="button"
              onClick={() => onCopy(result.url)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-rose px-3 py-1.5 text-xs font-medium text-ivory"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? 'Copied' : 'Copy Link'}
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a
            href={result.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink shadow-soft"
          >
            <ExternalLink className="h-4 w-4" />
            Open Live Invite
          </a>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-champagne-deep/50 bg-ivory/70 px-6 py-3 text-sm font-medium text-ink"
          >
            Create Another Invite
          </button>
        </div>
      </div>
    </div>
  )
}

// Searchable dropdown of active partners — plain filtered list (this app
// has no combobox component to reuse), only rendered once "Partner
// Co-Branded" is picked as the destination.
function PartnerPicker({ partners, loading, value, onChange }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const selected = partners.find((p) => p.id === value) || null
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return partners
    return partners.filter((p) => p.businessName.toLowerCase().includes(q) || p.email.toLowerCase().includes(q))
  }, [partners, query])

  return (
    <div className="relative">
      <label className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink-soft">
        <Users className="h-3.5 w-3.5 text-rose" />
        Partner
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-soft/60" />
        <input
          type="text"
          value={open ? query : selected?.businessName || ''}
          onFocus={() => {
            setOpen(true)
            setQuery('')
          }}
          onChange={(e) => setQuery(e.target.value)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={loading ? 'Loading partners…' : 'Search active partners…'}
          disabled={loading}
          className="w-full rounded-xl border border-champagne-deep/50 bg-ivory/70 py-3 pl-9 pr-4 text-ink placeholder:text-ink-soft/60 transition-shadow focus:outline-none focus:ring-2 focus:ring-gold-soft disabled:opacity-60"
        />
      </div>
      {open && (
        <div className="absolute z-20 mt-1.5 max-h-64 w-full overflow-y-auto rounded-xl border border-champagne-deep/50 bg-ivory shadow-card">
          {filtered.length === 0 ? (
            <p className="px-4 py-3 text-sm text-ink-soft">No active partners match.</p>
          ) : (
            filtered.map((p) => (
              <button
                key={p.id}
                type="button"
                // onMouseDown (not onClick) fires before the input's onBlur
                // closes this list — onClick alone would never register.
                onMouseDown={() => {
                  onChange(p.id)
                  setOpen(false)
                }}
                className={`block w-full truncate px-4 py-2.5 text-left text-sm hover:bg-blush/40 ${
                  p.id === value ? 'bg-blush/60 text-rose' : 'text-ink'
                }`}
              >
                {p.businessName} <span className="text-ink-soft/70">· {p.email}</span>
              </button>
            ))
          )}
        </div>
      )}
      {selected && !open && <p className="mt-1.5 text-xs text-ink-soft/70">{selected.email}</p>}
    </div>
  )
}

// "Create Invite" in the admin sidebar (see AdminShell.jsx) — a Super
// Admin's own generation path, isolated from both the B2C Razorpay checkout
// (CreateInvitePage.jsx) and the B2B credit-spend builder
// (PartnerCreateInvitePage.jsx): no payment, no credit deducted, either
// destination. Collects the same full field set those two builders do
// (Family Details, Function Name, Opening Greeting, Photos, Additional
// Events, Background Music, plus the host's/client's own contact details)
// so an admin-minted invite is indistinguishable from a paid/credit-spent
// one to anyone who opens it — right down to getting the same
// confirmation email. See api/_lib/adminCreateInvite.js for everything
// this can and can't touch.
//
// EXCEPT for a template flagged `simplifiedInviteFields` in
// templatesData.js (currently just Mahogany Seal) — its own lead-capture
// page (MahoganySealCreatePage.jsx) collects a shorter, different field
// set, so this form hides the fields that template has no use for the
// moment it's picked, on either destination. Every other template's
// workflow is completely unaffected — see `restrictedFields` below.
export default function AdminCreateInvitePage() {
  const { accessToken } = usePartnerAuth()
  const [gateStatus, setGateStatus] = useState('loading') // loading | success | forbidden | error

  const [destination, setDestination] = useState('direct') // 'direct' | 'partner'
  const [partnerId, setPartnerId] = useState('')
  const [partners, setPartners] = useState([])
  const [partnersLoading, setPartnersLoading] = useState(false)

  const [templateId, setTemplateId] = useState('')
  const selectedTemplate = TEMPLATES.find((t) => t.id === templateId) || null
  // See the file-level comment above and templatesData.js's own comment on
  // this flag.
  const restrictedFields = Boolean(selectedTemplate?.simplifiedInviteFields)
  // Every bespoke `layout` template (Mahogany Seal, Royal Plum Curtain —
  // see layoutRegistry.js) splits the couple's single "names" string on
  // "&" to get two separate names for its two-sided layout
  // (MahoganySealAdapter.jsx/RoyalPlumCurtainAdapter.jsx's own
  // splitCoupleNames()). Typing anything other than "Name1 & Name2" into
  // one free-text field silently breaks that split — e.g. "Zachery Weds
  // Conner" renders as "Zachery Weds Conner & " with a stray trailing "&"
  // and nothing after it. Two dedicated fields here remove that ambiguity
  // entirely: whatever's typed into each is joined as "A & B" at submit
  // time, guaranteed to split back apart correctly downstream.
  const needsSplitNames = Boolean(selectedTemplate?.layout)
  const [form, setForm] = useState(EMPTY_FORM)
  const [photos, setPhotos] = useState([])
  const [events, setEvents] = useState([])
  const [song, setSong] = useState(null)
  // Mahogany Seal only (`restrictedFields`) — the real caricature intro
  // video, uploaded straight to Supabase Storage before this form is ever
  // submitted (see POST /api/admin/mahogany-video). Left blank, the live
  // invite falls back to the template's own default demo clip.
  const [caricatureVideoUrl, setCaricatureVideoUrl] = useState('')
  const [caricatureVideoUploading, setCaricatureVideoUploading] = useState(false)
  const [caricatureVideoError, setCaricatureVideoError] = useState(null)
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)

  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    adminGetMe(accessToken)
      .then(() => setGateStatus('success'))
      .catch((err) => setGateStatus(/not authorized|sign in required/i.test(err.message || '') ? 'forbidden' : 'error'))
  }, [accessToken])

  const loadPartners = useCallback(async () => {
    setPartnersLoading(true)
    try {
      const { partners: rows } = await adminListPartners(accessToken, 'active')
      setPartners(rows)
    } catch (err) {
      console.error('[AdminCreateInvite] failed to load partners:', err)
    } finally {
      setPartnersLoading(false)
    }
  }, [accessToken])

  useEffect(() => {
    if (destination === 'partner' && partners.length === 0 && !partnersLoading) loadPartners()
  }, [destination, partners.length, partnersLoading, loadPartners])

  // Photos are uploaded to whichever bucket matches the current
  // destination (see PhotoUploader.jsx: /api/photos -> `invite-photos`,
  // /api/partners/photos -> `partner-invite-photos`) — switching
  // destination mid-form clears any already-uploaded photos rather than
  // leaving URLs from the wrong bucket attached to the wrong table.
  const handleDestinationChange = (next) => {
    if (next === destination) return
    setDestination(next)
    setPhotos([])
  }

  const handleField = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleCaricatureVideoChange = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // lets the same file be re-selected after a remove
    if (!file) return

    setCaricatureVideoError(null)
    if (!ALLOWED_VIDEO_MIME_TYPES.includes(file.type)) {
      setCaricatureVideoError('Only MP4, WebM, or MOV videos are allowed')
      return
    }
    // Same "check before a single byte is sent" reasoning as
    // PhotoUploader.jsx's own MAX_PHOTO_BYTES pre-check — avoids the
    // formidable mid-upload abort that otherwise surfaces to the browser
    // as a bare "Failed to fetch" instead of a clean message.
    if (file.size > MAX_VIDEO_BYTES) {
      setCaricatureVideoError('File is too large (max 30MB)')
      return
    }

    setCaricatureVideoUploading(true)
    try {
      const url = await adminUploadMahoganyVideo(accessToken, file)
      setCaricatureVideoUrl(url)
    } catch (err) {
      console.error('[AdminCreateInvite] caricature video upload failed:', err)
      setCaricatureVideoError(err.message || 'Upload failed')
    } finally {
      setCaricatureVideoUploading(false)
    }
  }

  // The couple-names string every non-split-name template stores directly,
  // and every split-name template's own adapter later splits back apart on
  // "&" (see `needsSplitNames` above) — always built with " & " as the
  // join, regardless of which UI collected it, so that split is guaranteed
  // to work no matter what an admin actually typed into either field.
  const combinedNames = () =>
    needsSplitNames
      ? [form.partner1Name.trim(), form.partner2Name.trim()].filter(Boolean).join(' & ')
      : form.names.trim()

  // Keeps the slug in sync with the names field(s) until the admin edits
  // it by hand — the same "auto until touched" behavior the Custom Slug
  // Input's own auto-generate button gives access to on demand too.
  const handleNamesChange = (e) => {
    const value = e.target.value
    setForm((prev) => ({ ...prev, names: value }))
    if (!slugTouched) setSlug(value.trim() ? `${slugify(value)}-${randomSlugSuffix()}` : '')
  }

  const handlePartnerNameChange = (field) => (e) => {
    const value = e.target.value
    const partner1Name = field === 'partner1Name' ? value : form.partner1Name
    const partner2Name = field === 'partner2Name' ? value : form.partner2Name
    setForm((prev) => ({ ...prev, [field]: value }))
    if (!slugTouched) {
      const combined = [partner1Name.trim(), partner2Name.trim()].filter(Boolean).join(' & ')
      setSlug(combined ? `${slugify(combined)}-${randomSlugSuffix()}` : '')
    }
  }

  const handleAutoGenerateSlug = () => {
    const combined = combinedNames()
    setSlug(combined ? `${slugify(combined)}-${randomSlugSuffix()}` : `invite-${randomSlugSuffix()}`)
    setSlugTouched(true)
  }

  const slugFormatValid = !slug || SLUG_FORMAT_RE.test(slug)

  const isMissingRequired = () =>
    (needsSplitNames ? !form.partner1Name.trim() || !form.partner2Name.trim() : !form.names.trim()) ||
    !form.date ||
    !form.venue.trim() ||
    !templateId ||
    (destination === 'partner'
      ? !partnerId || !form.clientEmail.trim() || !form.clientPhone.trim()
      : !form.hostName.trim() || !form.hostEmail.trim() || !form.hostPhone.trim())

  const missingRequired = submitAttempted && isMissingRequired()
  const slugError = submitAttempted && slug && !slugFormatValid

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitAttempted(true)
    setSubmitError(null)
    if (isMissingRequired() || (slug && !slugFormatValid)) return

    setSubmitting(true)
    try {
      const created = await adminCreateInvite(accessToken, {
        destination,
        partnerId: destination === 'partner' ? partnerId : undefined,
        templateId,
        names: combinedNames(),
        // Fields this template's own lead-capture page never collects (see
        // `restrictedFields` above) — sent blank regardless of any stale
        // form state, not just hidden visually, so nothing typed before a
        // template switch can sneak into the saved invite.
        eventTitle: restrictedFields ? '' : form.eventTitle.trim(),
        date: form.date,
        time: form.time,
        venue: form.venue.trim(),
        locationUrl: restrictedFields ? '' : form.locationUrl.trim(),
        greetingLine: restrictedFields ? '' : form.greetingLine.trim(),
        message: form.message.trim(),
        groomName: restrictedFields ? '' : form.groomName.trim(),
        groomParents: restrictedFields ? '' : form.groomParents.trim(),
        brideName: restrictedFields ? '' : form.brideName.trim(),
        brideParents: restrictedFields ? '' : form.brideParents.trim(),
        clientEmail: destination === 'partner' ? form.clientEmail.trim() : '',
        clientPhone: destination === 'partner' ? form.clientPhone.trim() : '',
        hostName: destination === 'direct' ? form.hostName.trim() : '',
        hostEmail: destination === 'direct' ? form.hostEmail.trim() : '',
        hostPhone: destination === 'direct' ? form.hostPhone.trim() : '',
        photos,
        events,
        bgSongTitle: song?.title || '',
        bgSongArtist: song?.artist || '',
        bgSongAlbumArt: song?.albumArt || '',
        bgSongPreviewUrl: song?.previewUrl || '',
        caricatureVideoUrl: restrictedFields ? caricatureVideoUrl : '',
        hashtag: restrictedFields ? form.hashtag.trim() : '',
        slug: slug.trim(),
      })
      setResult(created)
    } catch (err) {
      console.error('[AdminCreateInvite] failed to create invite:', err)
      setSubmitError(err.message || 'Could not generate this invite.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopy = async (url) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('[AdminCreateInvite] clipboard copy failed:', err)
    }
  }

  const handleReset = () => {
    setResult(null)
    setDestination('direct')
    setPartnerId('')
    setTemplateId('')
    setForm(EMPTY_FORM)
    setPhotos([])
    setEvents([])
    setSong(null)
    setCaricatureVideoUrl('')
    setCaricatureVideoUploading(false)
    setCaricatureVideoError(null)
    setSlug('')
    setSlugTouched(false)
    setSubmitAttempted(false)
    setSubmitError(null)
    setCopied(false)
  }

  if (gateStatus === 'forbidden') return <AdminForbidden />

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 sm:py-14">
      <SEO title="Admin — Create Invite | InviteMyPeople" path="/admin/create-invite" noindex />

      <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">Admin Panel</p>
      <h1 className="mt-1 flex items-center gap-2 font-serif text-3xl text-ink">
        <Sparkles className="h-6 w-6 text-rose" />
        Create Invite (Admin Override)
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-soft">
        Mint a live invite directly — no Razorpay checkout, no partner credit spent, either way. Same
        details a paying customer or partner would fill in.
      </p>

      {gateStatus === 'loading' && (
        <div className="mt-10 flex items-center gap-2 text-ink-soft">
          <Loader2 className="h-4 w-4 animate-spin" />
          Checking access…
        </div>
      )}

      {gateStatus === 'error' && <p className="mt-10 text-ink-soft">Could not verify admin access.</p>}

      {gateStatus === 'success' && (
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="rounded-3xl border border-white/60 bg-ivory/60 backdrop-blur-xl p-6 shadow-card sm:p-8">
            <h2 className="mb-4 font-serif text-xl text-ink">Invite Destination</h2>
            <div className="inline-flex rounded-full border border-champagne-deep/50 bg-ivory/70 p-1">
              <button
                type="button"
                onClick={() => handleDestinationChange('direct')}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  destination === 'direct' ? 'bg-rose text-ivory shadow-card' : 'text-ink-soft hover:text-ink'
                }`}
              >
                Consumer Invite (/i/:slug)
              </button>
              <button
                type="button"
                onClick={() => handleDestinationChange('partner')}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  destination === 'partner' ? 'bg-rose text-ivory shadow-card' : 'text-ink-soft hover:text-ink'
                }`}
              >
                Partner Co-Branded Invite (/p/:slug)
              </button>
            </div>

            {destination === 'partner' && (
              <div className="mt-5">
                <PartnerPicker partners={partners} loading={partnersLoading} value={partnerId} onChange={setPartnerId} />
                {missingRequired && !partnerId && (
                  <p className="mt-1.5 text-xs text-red-500">Select a partner to assign this invite to.</p>
                )}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/60 bg-ivory/60 backdrop-blur-xl p-6 shadow-card sm:p-8">
            <h2 className="mb-4 font-serif text-xl text-ink">Template</h2>
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="w-full rounded-xl border border-champagne-deep/50 bg-ivory/70 px-4 py-3 text-ink transition-shadow focus:outline-none focus:ring-2 focus:ring-gold-soft"
            >
              <option value="">Select a template…</option>
              {TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} — {t.category}
                </option>
              ))}
            </select>
            {missingRequired && !templateId && (
              <p className="mt-1.5 text-xs text-red-500">Choose which template this invite should use.</p>
            )}
            {restrictedFields && (
              <p className="mt-2 text-xs text-ink-soft">
                {selectedTemplate.name} uses a shorter field set than other templates — the form below is
                simplified to match its own create-your-own page.
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-white/60 bg-ivory/60 backdrop-blur-xl p-6 shadow-card sm:p-8">
            <h2 className="mb-4 font-serif text-xl text-ink">Event Details</h2>
            <div className="space-y-5">
              {needsSplitNames ? (
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-ink-soft">
                    Couple Names
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      id="partner1Name"
                      type="text"
                      value={form.partner1Name}
                      onChange={handlePartnerNameChange('partner1Name')}
                      placeholder="Groom's name"
                      className="w-full min-w-0 flex-1 rounded-xl border border-champagne-deep/50 bg-ivory/70 px-4 py-3 text-ink placeholder:text-ink-soft/60 transition-shadow focus:outline-none focus:ring-2 focus:ring-gold-soft"
                    />
                    <span className="shrink-0 text-xs font-medium uppercase tracking-[0.15em] text-ink-soft">
                      Weds
                    </span>
                    <input
                      id="partner2Name"
                      type="text"
                      value={form.partner2Name}
                      onChange={handlePartnerNameChange('partner2Name')}
                      placeholder="Bride's name"
                      className="w-full min-w-0 flex-1 rounded-xl border border-champagne-deep/50 bg-ivory/70 px-4 py-3 text-ink placeholder:text-ink-soft/60 transition-shadow focus:outline-none focus:ring-2 focus:ring-gold-soft"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-ink-soft">
                    Kept as two separate fields for this template — it splits the couple&rsquo;s names apart to
                    show them individually.
                  </p>
                </div>
              ) : (
                <div>
                  <label htmlFor="names" className="mb-2 block text-xs uppercase tracking-[0.2em] text-ink-soft">
                    Host / Couple Names
                  </label>
                  <input
                    id="names"
                    type="text"
                    value={form.names}
                    onChange={handleNamesChange}
                    placeholder="e.g. Meenal & Avinash"
                    className="w-full rounded-xl border border-champagne-deep/50 bg-ivory/70 px-4 py-3 text-ink placeholder:text-ink-soft/60 transition-shadow focus:outline-none focus:ring-2 focus:ring-gold-soft"
                  />
                </div>
              )}

              {!restrictedFields && (
                <div>
                  <label className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink-soft">
                    <Users className="h-3.5 w-3.5 text-rose" />
                    Family Details <span className="normal-case text-ink-soft/70">(optional)</span>
                  </label>
                  <p className="mb-3 text-xs text-ink-soft">
                    Shown as two cards under the couple&rsquo;s names — e.g. &ldquo;Son of Mr. Rajesh &amp;
                    Mrs. Kavita Malhotra&rdquo;. Leave blank to skip this section.
                  </p>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={form.groomName}
                        onChange={handleField('groomName')}
                        placeholder="Groom's full name"
                        className="w-full rounded-xl border border-champagne-deep/50 bg-ivory/70 px-4 py-3 text-ink placeholder:text-ink-soft/60 transition-shadow focus:outline-none focus:ring-2 focus:ring-gold-soft"
                      />
                      <input
                        type="text"
                        value={form.groomParents}
                        onChange={handleField('groomParents')}
                        placeholder="e.g. Son of Mr. Rajesh & Mrs. Kavita Malhotra"
                        className="w-full rounded-xl border border-champagne-deep/50 bg-ivory/70 px-4 py-3 text-ink placeholder:text-ink-soft/60 transition-shadow focus:outline-none focus:ring-2 focus:ring-gold-soft"
                      />
                    </div>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={form.brideName}
                        onChange={handleField('brideName')}
                        placeholder="Bride's full name"
                        className="w-full rounded-xl border border-champagne-deep/50 bg-ivory/70 px-4 py-3 text-ink placeholder:text-ink-soft/60 transition-shadow focus:outline-none focus:ring-2 focus:ring-gold-soft"
                      />
                      <input
                        type="text"
                        value={form.brideParents}
                        onChange={handleField('brideParents')}
                        placeholder="e.g. Daughter of Mr. Anil & Mrs. Sunita Kapoor"
                        className="w-full rounded-xl border border-champagne-deep/50 bg-ivory/70 px-4 py-3 text-ink placeholder:text-ink-soft/60 transition-shadow focus:outline-none focus:ring-2 focus:ring-gold-soft"
                      />
                    </div>
                  </div>
                </div>
              )}

              {restrictedFields && (
                <div>
                  <label htmlFor="hashtag" className="mb-2 block text-xs uppercase tracking-[0.2em] text-ink-soft">
                    Wedding Hashtag <span className="normal-case text-ink-soft/70">(optional)</span>
                  </label>
                  <input
                    id="hashtag"
                    type="text"
                    maxLength={60}
                    value={form.hashtag}
                    onChange={handleField('hashtag')}
                    placeholder="e.g. #ShayaWedsRehaan"
                    className="w-full rounded-xl border border-champagne-deep/50 bg-ivory/70 px-4 py-3 text-ink placeholder:text-ink-soft/60 transition-shadow focus:outline-none focus:ring-2 focus:ring-gold-soft"
                  />
                  <p className="mt-1.5 text-xs text-ink-soft">
                    Stamped into the wax seal and repeated in the footer. Leave blank to use this template&rsquo;s
                    own default hashtag.
                  </p>
                </div>
              )}

              {!restrictedFields && (
                <div>
                  <label htmlFor="eventTitle" className="mb-2 block text-xs uppercase tracking-[0.2em] text-ink-soft">
                    Function Name <span className="normal-case text-ink-soft/70">(optional)</span>
                  </label>
                  <input
                    id="eventTitle"
                    type="text"
                    value={form.eventTitle}
                    onChange={handleField('eventTitle')}
                    placeholder="e.g. Wedding Ceremony"
                    className="w-full rounded-xl border border-champagne-deep/50 bg-ivory/70 px-4 py-3 text-ink placeholder:text-ink-soft/60 transition-shadow focus:outline-none focus:ring-2 focus:ring-gold-soft"
                  />
                </div>
              )}

              {destination === 'partner' ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="clientEmail" className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink-soft">
                      <Mail className="h-3.5 w-3.5 text-rose" />
                      Client&rsquo;s Email
                    </label>
                    <input
                      id="clientEmail"
                      type="email"
                      required
                      value={form.clientEmail}
                      onChange={handleField('clientEmail')}
                      placeholder="couple@example.com"
                      className="w-full rounded-xl border border-champagne-deep/50 bg-ivory/70 px-4 py-3 text-ink placeholder:text-ink-soft/60 transition-shadow focus:outline-none focus:ring-2 focus:ring-gold-soft"
                    />
                  </div>
                  <div>
                    <label htmlFor="clientPhone" className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink-soft">
                      <Phone className="h-3.5 w-3.5 text-rose" />
                      Client&rsquo;s Phone
                    </label>
                    <input
                      id="clientPhone"
                      type="tel"
                      required
                      value={form.clientPhone}
                      onChange={handleField('clientPhone')}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-xl border border-champagne-deep/50 bg-ivory/70 px-4 py-3 text-ink placeholder:text-ink-soft/60 transition-shadow focus:outline-none focus:ring-2 focus:ring-gold-soft"
                    />
                  </div>
                  <p className="sm:col-span-2 -mt-2 text-xs text-ink-soft">
                    We&rsquo;ll email your client their live invitation link and private dashboard link as soon as it&rsquo;s generated.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="hostName" className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink-soft">
                      <Users className="h-3.5 w-3.5 text-rose" />
                      Host&rsquo;s Name
                    </label>
                    <input
                      id="hostName"
                      type="text"
                      required
                      value={form.hostName}
                      onChange={handleField('hostName')}
                      placeholder="Who's organizing this invite?"
                      className="w-full rounded-xl border border-champagne-deep/50 bg-ivory/70 px-4 py-3 text-ink placeholder:text-ink-soft/60 transition-shadow focus:outline-none focus:ring-2 focus:ring-gold-soft"
                    />
                  </div>
                  <div>
                    <label htmlFor="hostEmail" className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink-soft">
                      <Mail className="h-3.5 w-3.5 text-rose" />
                      Host&rsquo;s Email
                    </label>
                    <input
                      id="hostEmail"
                      type="email"
                      required
                      value={form.hostEmail}
                      onChange={handleField('hostEmail')}
                      placeholder="host@example.com"
                      className="w-full rounded-xl border border-champagne-deep/50 bg-ivory/70 px-4 py-3 text-ink placeholder:text-ink-soft/60 transition-shadow focus:outline-none focus:ring-2 focus:ring-gold-soft"
                    />
                  </div>
                  <div>
                    <label htmlFor="hostPhone" className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink-soft">
                      <Phone className="h-3.5 w-3.5 text-rose" />
                      Host&rsquo;s Phone
                    </label>
                    <input
                      id="hostPhone"
                      type="tel"
                      required
                      value={form.hostPhone}
                      onChange={handleField('hostPhone')}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-xl border border-champagne-deep/50 bg-ivory/70 px-4 py-3 text-ink placeholder:text-ink-soft/60 transition-shadow focus:outline-none focus:ring-2 focus:ring-gold-soft"
                    />
                  </div>
                  <p className="sm:col-span-2 -mt-2 text-xs text-ink-soft">
                    We&rsquo;ll email the host their live invitation link and private host-dashboard link as soon as it&rsquo;s generated.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="date" className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink-soft">
                    <Calendar className="h-3.5 w-3.5 text-rose" />
                    Event Date
                  </label>
                  <input
                    id="date"
                    type="date"
                    // No min= (unlike the paid builders) — an admin
                    // override may legitimately backfill a past event.
                    value={form.date}
                    onChange={handleField('date')}
                    className="w-full rounded-xl border border-champagne-deep/50 bg-ivory/70 px-4 py-3 text-ink transition-shadow focus:outline-none focus:ring-2 focus:ring-gold-soft"
                  />
                </div>
                <div>
                  <label htmlFor="time" className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink-soft">
                    <Clock className="h-3.5 w-3.5 text-rose" />
                    Event Time <span className="normal-case text-ink-soft/70">(optional)</span>
                  </label>
                  <input
                    id="time"
                    type="time"
                    value={form.time}
                    onChange={handleField('time')}
                    className="w-full rounded-xl border border-champagne-deep/50 bg-ivory/70 px-4 py-3 text-ink transition-shadow focus:outline-none focus:ring-2 focus:ring-gold-soft"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="venue" className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink-soft">
                  <MapPin className="h-3.5 w-3.5 text-rose" />
                  Venue
                </label>
                <input
                  id="venue"
                  type="text"
                  value={form.venue}
                  onChange={handleField('venue')}
                  placeholder="e.g. Rambagh Palace Gardens, Jaipur"
                  className="w-full rounded-xl border border-champagne-deep/50 bg-ivory/70 px-4 py-3 text-ink placeholder:text-ink-soft/60 transition-shadow focus:outline-none focus:ring-2 focus:ring-gold-soft"
                />
              </div>

              {!restrictedFields && (
                <div>
                  <label htmlFor="locationUrl" className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink-soft">
                    <LinkIcon className="h-3.5 w-3.5 text-rose" />
                    Google Maps URL <span className="normal-case text-ink-soft/70">(optional)</span>
                  </label>
                  <input
                    id="locationUrl"
                    type="text"
                    value={form.locationUrl}
                    onChange={handleField('locationUrl')}
                    placeholder="Paste your Google Maps link"
                    className="w-full rounded-xl border border-champagne-deep/50 bg-ivory/70 px-4 py-3 text-ink placeholder:text-ink-soft/60 transition-shadow focus:outline-none focus:ring-2 focus:ring-gold-soft"
                  />
                </div>
              )}

              {!restrictedFields && (
                <div>
                  <label htmlFor="greetingLine" className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink-soft">
                    <Sparkles className="h-3.5 w-3.5 text-rose" />
                    Opening Greeting <span className="normal-case text-ink-soft/70">(optional)</span>
                  </label>
                  <input
                    id="greetingLine"
                    type="text"
                    maxLength={80}
                    value={form.greetingLine}
                    onChange={handleField('greetingLine')}
                    placeholder='e.g. "Shubh Vivah" or "Together With Love"'
                    className="w-full rounded-xl border border-champagne-deep/50 bg-ivory/70 px-4 py-3 text-ink placeholder:text-ink-soft/60 transition-shadow focus:outline-none focus:ring-2 focus:ring-gold-soft"
                  />
                  <p className="mt-1.5 text-xs text-ink-soft">
                    Shown just above the couple&rsquo;s names. Leave blank to use this template&rsquo;s own line.
                  </p>
                </div>
              )}

              <div>
                <label htmlFor="message" className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink-soft">
                  <MessageSquareText className="h-3.5 w-3.5 text-rose" />
                  {restrictedFields ? 'Footer Message' : 'Custom Message'}{' '}
                  <span className="normal-case text-ink-soft/70">(optional)</span>
                </label>
                <textarea
                  id="message"
                  rows={3}
                  value={form.message}
                  onChange={handleField('message')}
                  placeholder="Share a warm note for the guests"
                  className="w-full resize-none rounded-xl border border-champagne-deep/50 bg-ivory/70 px-4 py-3 text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-gold-soft"
                />
              </div>

              {restrictedFields && (
                <div>
                  <label className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink-soft">
                    <Film className="h-3.5 w-3.5 text-rose" />
                    Caricature Video <span className="normal-case text-ink-soft/70">(optional)</span>
                  </label>
                  <p className="mb-3 text-xs text-ink-soft">
                    The cinematic intro video, hand-produced from the couple's photos. Leave blank and this
                    invite plays our default caricature video instead.
                  </p>
                  <div className="flex items-center gap-3">
                    <label className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-champagne-deep/50 bg-ivory/70 px-4 py-2.5 text-xs font-medium text-ink hover:bg-ivory">
                      {caricatureVideoUploading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Film className="h-3.5 w-3.5" />
                      )}
                      {caricatureVideoUploading ? 'Uploading…' : caricatureVideoUrl ? 'Replace Video' : 'Upload Video'}
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        className="hidden"
                        onChange={handleCaricatureVideoChange}
                        disabled={caricatureVideoUploading}
                      />
                    </label>
                    {caricatureVideoUrl && !caricatureVideoUploading && (
                      <span className="inline-flex min-w-0 items-center gap-1.5 text-xs text-ink-soft">
                        <Check className="h-3.5 w-3.5 shrink-0 text-rose" />
                        <span className="truncate">Video attached</span>
                        <button
                          type="button"
                          onClick={() => setCaricatureVideoUrl('')}
                          aria-label="Remove video"
                          className="shrink-0 text-ink-soft/70 hover:text-rose"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    )}
                  </div>
                  {caricatureVideoError && <p className="mt-1.5 text-xs text-red-500">{caricatureVideoError}</p>}
                  <p className="mt-1.5 text-xs text-ink-soft">MP4, WebM, or MOV, up to 30MB.</p>
                </div>
              )}

              <div>
                <label className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink-soft">
                  <Camera className="h-3.5 w-3.5 text-rose" />
                  {restrictedFields ? 'Gallery Photos' : 'Photos'}{' '}
                  <span className="normal-case text-ink-soft/70">(optional)</span>
                </label>
                <PhotoUploader
                  key={destination}
                  photos={photos}
                  onChange={setPhotos}
                  endpoint={destination === 'partner' ? '/api/partners/photos' : '/api/photos'}
                  token={destination === 'partner' ? accessToken : undefined}
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink-soft">
                  <CalendarPlus className="h-3.5 w-3.5 text-rose" />
                  {restrictedFields ? 'Events' : 'Additional Events'}{' '}
                  <span className="normal-case text-ink-soft/70">(optional)</span>
                </label>
                <p className="mb-3 text-xs text-ink-soft">
                  Add other functions — Haldi, Sangeet, Mehndi, Reception — each with its own date, time and venue.
                </p>
                <EventsListEditor events={events} onChange={setEvents} />
              </div>

              <div className="border-t border-champagne-deep/30 pt-5">
                <label className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink-soft">
                  <Music2 className="h-3.5 w-3.5 text-rose" />
                  Background Music Selection <span className="normal-case text-ink-soft/70">(optional)</span>
                </label>
                <p className="mb-3 text-xs text-ink-soft">
                  Search Spotify, preview any track, then confirm one to play the moment guests open the invitation.
                  {restrictedFields && ' Leave blank to use this template’s own default track.'}
                </p>
                <SongSearchPicker value={song} onConfirm={setSong} onRemove={() => setSong(null)} />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/60 bg-ivory/60 backdrop-blur-xl p-6 shadow-card sm:p-8">
            <h2 className="mb-4 font-serif text-xl text-ink">Custom Slug</h2>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value.trim().toLowerCase())
                  setSlugTouched(true)
                }}
                placeholder="auto-generated-from-names"
                className="w-full rounded-xl border border-champagne-deep/50 bg-ivory/70 px-4 py-3 text-ink placeholder:text-ink-soft/60 transition-shadow focus:outline-none focus:ring-2 focus:ring-gold-soft"
              />
              <button
                type="button"
                onClick={handleAutoGenerateSlug}
                title="Auto-generate from names"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-champagne-deep/50 bg-ivory/70 px-3.5 py-3 text-xs font-medium text-ink hover:bg-ivory"
              >
                <Wand2 className="h-3.5 w-3.5" />
                Auto
              </button>
            </div>
            <p className="mt-1.5 text-xs text-ink-soft">
              Live link: <span className="text-ink">
                {destination === 'direct' ? '/i/' : '/p/'}
                {slug || '…'}
              </span>
              . Lowercase letters, numbers, and hyphens only. Leave blank to auto-generate on save.
            </p>
            {slugError && (
              <p className="mt-1.5 text-xs text-red-500">
                Slug may only contain lowercase letters, numbers, and hyphens.
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-white/60 bg-ivory/60 backdrop-blur-xl p-6 shadow-card sm:p-8">
            {missingRequired && (
              <div className="mb-4 flex gap-2 rounded-xl border border-rose/40 bg-blush/50 px-4 py-3 text-sm text-ink">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose" />
                <span>
                  Please fill in the couple/host names, event date, venue, a template, and{' '}
                  {destination === 'partner'
                    ? "a partner plus the client's email and phone number"
                    : "the host's name, email, and phone number"}{' '}
                  before generating.
                </span>
              </div>
            )}
            {submitError && (
              <div className="mb-4 flex gap-2 rounded-xl border border-rose/40 bg-blush/50 px-4 py-3 text-sm text-ink">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose" />
                <span>{submitError}</span>
              </div>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-gold px-5 py-4 text-base font-semibold text-ink shadow-soft transition-transform disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 shrink-0" />
                  Generate Invite (Admin Override)
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {result && <SuccessModal result={result} onCopy={handleCopy} copied={copied} onClose={handleReset} />}
    </div>
  )
}
