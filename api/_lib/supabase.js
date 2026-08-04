// Shared Supabase client for the invites API's Serverless Functions (see
// ../invites/index.js and ../invites/[slug].js). Server-side only — these
// env vars are never VITE_-prefixed, so unlike VITE_RSVP_ENDPOINT they're
// never bundled into the public JS. Set in the Vercel project's
// Environment Variables (Settings → Environment Variables), not in .env.
import { createClient } from '@supabase/supabase-js'

let client = null

export function getSupabase() {
  if (client) return client

  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      'SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set for this deployment.',
    )
  }

  client = createClient(url, key, { auth: { persistSession: false } })
  return client
}
