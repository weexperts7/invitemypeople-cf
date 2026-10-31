// Super Admin Template Price Management — shared handler implementations
// for BOTH the Vercel Serverless Functions (api/template-prices.js,
// api/admin/template-prices/index.js, api/admin/template-prices/reset.js)
// AND their local-dev Express registrations in server/index.js. Same sharing
// pattern as api/_lib/partnerHandlers.js (one handler, no dev/prod
// divergence) since — like the partner tables — there's no flat-file
// equivalent for this data; it only ever lives in Supabase. See
// supabase/migrations/0009_template_prices.sql for the table this reads
// and writes.
//
// Deliberately does NOT import src/data/builderTemplates.js (or
// templatesData.js/ganeshTemplatesData.js/satsangTemplatesData.js): those
// pull in lucide-react + JSX icon components, which only a bundler (Vite)
// can parse — safe from React admin pages, fatal from this file, which
// plain Node (`node server/index.js`, no bundler) and Vercel's Node
// runtime both import directly. See pricing.js's own comment for the same
// import-safety rule. This module only ever needs a template's *key* and
// an admin-supplied *name* (passed through from the request body, not read
// from the catalog), never anything else about the templates catalog.
import { getSupabase } from './supabase.js'
import { requireAdmin } from './auth.js'
import { getDefaultPrice } from '../../src/data/sale.js'

export function clean(value, max) {
  return String(value ?? '')
    .trim()
    .slice(0, max)
}

const MIN_PRICE = 1
const MAX_PRICE = 100000

/**
 * The price actually charged for a given template right now: its admin-set
 * override if one exists, otherwise its default (Guruji Satsang's own price, or
 * the launch-sale price while it's running and the standing launch price once
 * it ends — see src/data/sale.js). Used by POST /api/create-order to re-derive the
 * expected charge server-side.
 *
 * Never throws: a missing/misconfigured Supabase connection, a network
 * blip, or an unrecognized templateKey all fall back to the same global
 * default every template already used before this feature existed — so a
 * pricing lookup failure can never be the reason checkout breaks.
 */
export async function getEffectivePrice(templateKey) {
  const fallback = getDefaultPrice(templateKey)
  const key = clean(templateKey, 80)
  if (!key) return fallback

  try {
    const { data, error } = await getSupabase()
      .from('template_prices')
      .select('price')
      .eq('template_key', key)
      .maybeSingle()
    if (error) throw error

    const price = Number(data?.price)
    return Number.isFinite(price) && price > 0 ? price : fallback
  } catch (err) {
    console.error(`[template-prices] lookup failed for "${key}", using the default price instead:`, err)
    return fallback
  }
}

// ---------------------------------------------------------------------------
// GET /api/template-prices — public, unauthenticated. Every template price
// *override* currently set (templates without one aren't listed — callers
// fall back to getActivePrice() for those, exactly preserving today's
// pricing for anything an admin hasn't touched). Read by both the public
// checkout flow (CreateInvitePage.jsx, to show/charge the right price) and
// the Super Admin pricing page (to show current overrides before editing).
// Not sensitive data — every price here is already shown on the public
// site — so this is deliberately not behind requireAdmin().
// ---------------------------------------------------------------------------
export async function listTemplatePrices(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ ok: false, error: 'method not allowed' })
  }

  try {
    const { data, error } = await getSupabase()
      .from('template_prices')
      .select('template_key, name, price, updated_at')
      .order('template_key', { ascending: true })
    if (error) throw error

    res.status(200).json({
      ok: true,
      prices: (data || []).map((row) => ({
        templateKey: row.template_key,
        name: row.name,
        price: row.price,
        updatedAt: row.updated_at,
      })),
    })
  } catch (err) {
    // A visitor's checkout price should never break just because this
    // listing failed — an empty override list is exactly what "nothing
    // configured yet" looks like anyway, so every caller (CreateInvitePage
    // included) already treats a missing entry as "use the default price".
    console.error('[template-prices] failed to list overrides:', err)
    res.status(200).json({ ok: true, prices: [] })
  }
}

// ---------------------------------------------------------------------------
// POST /api/admin/template-prices — admin only. body: { templateKey, name,
// price }. Upserts one template's price override. `price` is rupees (not
// paise), whole number, bounded to a sane range so a fat-fingered admin
// entry can't silently create a ₹0 or ₹5,000,000 checkout.
// ---------------------------------------------------------------------------
export async function adminUpsertTemplatePrice(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'method not allowed' })
  }

  const admin = await requireAdmin(req, res)
  if (!admin) return

  try {
    const body = req.body || {}
    const templateKey = clean(body.templateKey, 80)
    const name = clean(body.name, 120)
    const price = Math.round(Number(body.price))

    if (!templateKey) return res.status(400).json({ ok: false, error: 'templateKey is required' })
    if (!Number.isFinite(price) || price < MIN_PRICE || price > MAX_PRICE) {
      return res.status(400).json({ ok: false, error: `price must be between ₹${MIN_PRICE} and ₹${MAX_PRICE}` })
    }

    const { data, error } = await getSupabase()
      .from('template_prices')
      .upsert({ template_key: templateKey, name: name || null, price }, { onConflict: 'template_key' })
      .select('template_key, name, price, updated_at')
      .single()
    if (error) throw error

    console.log(`[admin] ${admin.email} set "${templateKey}" price to ₹${price}`)
    res.status(200).json({
      ok: true,
      row: { templateKey: data.template_key, name: data.name, price: data.price, updatedAt: data.updated_at },
    })
  } catch (err) {
    console.error('[admin] failed to set template price:', err)
    res.status(500).json({ ok: false, error: 'could not save this price' })
  }
}

// ---------------------------------------------------------------------------
// POST /api/admin/template-prices/reset — admin only. body: { templateKey }.
// Deletes a template's override so it reverts to the global default price
// (see getEffectivePrice() above) — the "undo" for adminUpsertTemplatePrice.
// Deleting a row that doesn't exist is a no-op, not an error: resetting an
// already-default template should never fail.
// ---------------------------------------------------------------------------
export async function adminResetTemplatePrice(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'method not allowed' })
  }

  const admin = await requireAdmin(req, res)
  if (!admin) return

  try {
    const templateKey = clean((req.body || {}).templateKey, 80)
    if (!templateKey) return res.status(400).json({ ok: false, error: 'templateKey is required' })

    const { error } = await getSupabase().from('template_prices').delete().eq('template_key', templateKey)
    if (error) throw error

    console.log(`[admin] ${admin.email} reset "${templateKey}" to the default price`)
    res.status(200).json({ ok: true })
  } catch (err) {
    console.error('[admin] failed to reset template price:', err)
    res.status(500).json({ ok: false, error: 'could not reset this price' })
  }
}
