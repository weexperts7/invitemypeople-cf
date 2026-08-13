// Shared auth helpers for the partner-portal Serverless Functions
// (api/partners/*, api/admin/*) — mirrors the split in api/_lib/invites.js:
// one small module the Vercel functions and their server/index.js local-dev
// twins both import.
//
// Partner accounts are real Supabase Auth users (see
// supabase/migrations/0001_b2b_partner_portal.sql's header) created via the
// service-role Admin API, and log in client-side with the anon key
// (src/utils/supabaseClient.js) — this app's first use of Supabase Auth.
// Every request that needs to know "who is this" sends that session's
// access token as `Authorization: Bearer <token>`; getRequestUser() below
// hands it to the SAME service-role client the rest of this app already
// uses (api/_lib/supabase.js) to resolve it back to a user, so no separate
// anon-key client is ever needed server-side.
import { getSupabase } from './supabase.js'

/**
 * Resolves the bearer token on `req` to a Supabase Auth user, or null if
 * there isn't one / it's invalid or expired. Never throws.
 */
export async function getRequestUser(req) {
  const header = req.headers?.authorization || req.headers?.Authorization || ''
  const token = String(header).match(/^Bearer\s+(.+)$/i)?.[1]
  if (!token) return null

  try {
    const { data, error } = await getSupabase().auth.getUser(token)
    if (error || !data?.user) return null
    return data.user
  } catch (err) {
    console.error('[auth] failed to resolve bearer token:', err)
    return null
  }
}

/**
 * ADMIN_EMAILS is a plain comma-separated allowlist (e.g.
 * "founder@invitemypeople.com, ops@invitemypeople.com") — the "simple admin
 * dashboard, no separate admin-accounts table" approach: anyone who can log
 * in with one of these emails (as a normal Supabase Auth user — the same
 * signInWithPassword() the partner login page uses) is treated as an admin.
 * Set in Vercel's dashboard-only env vars, same as SUPABASE_SERVICE_ROLE_KEY
 * — never VITE_-prefixed, or the allowlist would ship in the public bundle.
 */
export function isAdminEmail(email) {
  const list = String(process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return list.length > 0 && list.includes(String(email ?? '').toLowerCase())
}

/**
 * Resolves the requesting user and requires they be logged in — the first
 * line of every /api/partners/* route that needs to know which partner is
 * asking. Writes a 401 response and returns null on failure so callers can
 * `if (!user) return`.
 */
export async function requireUser(req, res) {
  const user = await getRequestUser(req)
  if (!user) {
    res.status(401).json({ ok: false, error: 'sign in required' })
    return null
  }
  return user
}

/**
 * Same as requireUser(), plus the admin-email check — every /api/admin/*
 * route's first line.
 */
export async function requireAdmin(req, res) {
  const user = await requireUser(req, res)
  if (!user) return null
  if (!isAdminEmail(user.email)) {
    res.status(403).json({ ok: false, error: 'not authorized' })
    return null
  }
  return user
}
