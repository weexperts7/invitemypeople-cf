import { useCallback, useEffect, useMemo, useState } from 'react'
import { Check, IndianRupee, Loader2, Pencil, RotateCcw, X } from 'lucide-react'
import SEO from '../../components/SEO'
import AdminForbidden from '../../components/admin/AdminForbidden'
import { usePartnerAuth } from '../../hooks/usePartnerAuth'
import { adminGetMe } from '../../utils/partnerApi'
import { getTemplatePrices, setTemplatePrice, resetTemplatePrice } from '../../utils/templatePriceApi'
import { OCCASIONS, BUILDER_TEMPLATES } from '../../data/builderTemplates'
import { PRICING } from '../../data/templatesData'
import { getActivePrice, getDefaultPrice, isSaleActive } from '../../data/sale'

const MIN_PRICE = 1
const MAX_PRICE = 100000

function EditableRow({ template, override, onSave, onReset }) {
  const defaultPrice = getDefaultPrice(template.id)
  const effectivePrice = override?.price ?? defaultPrice
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(String(effectivePrice))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const startEdit = () => {
    setValue(String(effectivePrice))
    setError(null)
    setEditing(true)
  }

  const cancel = () => {
    setEditing(false)
    setError(null)
  }

  const save = async () => {
    const price = Math.round(Number(value))
    if (!Number.isFinite(price) || price < MIN_PRICE || price > MAX_PRICE) {
      setError(`Enter a whole number between ₹${MIN_PRICE} and ₹${MAX_PRICE.toLocaleString('en-IN')}`)
      return
    }
    setBusy(true)
    setError(null)
    try {
      await onSave(template, price)
      setEditing(false)
    } catch (err) {
      setError(err.message || 'Could not save this price')
    } finally {
      setBusy(false)
    }
  }

  const doReset = async () => {
    setBusy(true)
    setError(null)
    try {
      await onReset(template)
      setEditing(false)
    } catch (err) {
      setError(err.message || 'Could not reset this price')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rounded-2xl border border-white/60 bg-ivory/60 px-5 py-4 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-ink">{template.name}</p>
          <p className="mt-0.5 text-xs text-ink-soft/70">{template.id}</p>
        </div>

        {editing ? (
          <div className="flex items-center gap-2">
            <div className="relative">
              <IndianRupee className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-soft/60" />
              <input
                type="number"
                inputMode="numeric"
                min={MIN_PRICE}
                max={MAX_PRICE}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                autoFocus
                className="w-28 rounded-full border border-champagne-deep/50 bg-ivory py-1.5 pl-7 pr-3 text-sm text-ink focus:border-rose focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={save}
              disabled={busy}
              aria-label="Save price"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-rose text-ivory disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              onClick={cancel}
              disabled={busy}
              aria-label="Cancel"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-champagne-deep/50 text-ink-soft hover:text-ink"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-champagne/40 px-3 py-1.5 text-sm font-medium text-ink">
              &#8377;{effectivePrice.toLocaleString('en-IN')}
            </span>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                override ? 'bg-blush text-rose' : 'bg-ivory/70 text-ink-soft'
              }`}
            >
              {override ? 'Custom' : 'Default'}
            </span>
            <button
              type="button"
              onClick={startEdit}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-champagne-deep/50 text-ink-soft hover:text-ink"
              aria-label={`Edit price for ${template.name}`}
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            {override && (
              <button
                type="button"
                onClick={doReset}
                disabled={busy}
                title="Reset to the default price"
                aria-label={`Reset price for ${template.name} to default`}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-champagne-deep/50 text-ink-soft hover:text-ink disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
              </button>
            )}
          </div>
        )}
      </div>
      {error && <p className="mt-2 text-xs text-rose">{error}</p>}
      {override?.updatedAt && !editing && (
        <p className="mt-2 text-[11px] text-ink-soft/60">
          Last updated {new Date(override.updatedAt).toLocaleString('en-IN')}
        </p>
      )}
    </div>
  )
}

// "Template Pricing" in the admin sidebar (see AdminShell.jsx) — a Super
// Admin's control over what each template in the Invitation Builder
// (/create) actually charges. Every template starts on the same dynamic
// default (the launch-sale price while it's running, the standing launch
// price once it ends — see ../../data/sale.js) that already applied to
// every template before this page existed; setting a price here pins just
// THAT template until it's reset. See api/_lib/templatePrices.js for the
// server side — POST /api/create-order re-derives the exact same effective
// price this page shows, so checkout can never drift from what's
// configured here.
export default function AdminPricingPage() {
  const { accessToken } = usePartnerAuth()
  const [overrides, setOverrides] = useState({})
  const [status, setStatus] = useState('loading') // loading | success | forbidden | error

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      // Cheapest admin-only route (see api/_lib/partnerHandlers.js's
      // adminGetMe() comment) — gates this page the same way every other
      // /admin/* page does, since the actual price listing below is a
      // public endpoint (also used by the checkout flow) and would never
      // 403 on its own.
      await adminGetMe(accessToken)
      const rows = await getTemplatePrices()
      setOverrides(Object.fromEntries(rows.map((row) => [row.templateKey, row])))
      setStatus('success')
    } catch (err) {
      setStatus(/not authorized|sign in required/i.test(err.message || '') ? 'forbidden' : 'error')
    }
  }, [accessToken])

  useEffect(() => {
    load()
  }, [load])

  const handleSave = async (template, price) => {
    const result = await setTemplatePrice(accessToken, { templateKey: template.id, name: template.name, price })
    setOverrides((prev) => ({ ...prev, [template.id]: result.row }))
  }

  const handleReset = async (template) => {
    await resetTemplatePrice(accessToken, template.id)
    setOverrides((prev) => {
      const next = { ...prev }
      delete next[template.id]
      return next
    })
  }

  const templatesByOccasion = useMemo(() => {
    return OCCASIONS.map((occasion) => ({
      occasion,
      templates: BUILDER_TEMPLATES.filter((t) => t.occasion === occasion.id),
    })).filter((group) => group.templates.length > 0)
  }, [])

  if (status === 'forbidden') return <AdminForbidden />

  const saleLive = isSaleActive()

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 sm:py-14">
      <SEO title="Admin — Template Pricing | InviteMyPeople" path="/admin/pricing" noindex />

      <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">Admin Panel</p>
      <h1 className="mt-1 flex items-center gap-2 font-serif text-3xl text-ink">
        <IndianRupee className="h-6 w-6 text-rose" />
        Template Pricing
      </h1>
      <p className="mt-1 text-sm text-ink-soft">
        Set a custom price for any template, or leave it on the default — the same launch-sale-aware price
        (&#8377;{getActivePrice().toLocaleString('en-IN')} right now{saleLive ? ', sale live' : ''}, &#8377;
        {PRICING.price.toLocaleString('en-IN')} standard) every template used before this page existed.
      </p>

      <div className="mt-6">
        {status === 'loading' && (
          <div className="flex items-center gap-2 py-16 text-ink-soft">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading templates…
          </div>
        )}
        {status === 'error' && <p className="py-16 text-ink-soft">Could not load template pricing.</p>}

        {status === 'success' &&
          templatesByOccasion.map(({ occasion, templates }) => (
            <div key={occasion.id} className="mb-8">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.1em] text-ink-soft">
                <occasion.icon className="h-4 w-4" />
                {occasion.label}
              </h2>
              <div className="space-y-3">
                {templates.map((template) => (
                  <EditableRow
                    key={template.id}
                    template={template}
                    override={overrides[template.id]}
                    onSave={handleSave}
                    onReset={handleReset}
                  />
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
