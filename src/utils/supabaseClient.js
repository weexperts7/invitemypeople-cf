// Browser-side Supabase client — used ONLY for Supabase Auth (partner/admin
// login, signup, session refresh). This is the first client-side Supabase
// usage in this app; everywhere else (invites, RSVPs) the browser only ever
// talks to this app's own /api/* routes, which hold the service-role key
// server-side (see api/_lib/supabase.js). That pattern still holds for all
// partner-portal *data* — every read/write of partners/credits/branding
// goes through /api/partners/* and /api/admin/* with this session's access
// token as a Bearer header (see partnerApi.js) — this client's only job is
// managing the login session itself, which is what the anon key + Supabase
// Auth (GoTrue) is designed to be exposed to a browser for.
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  // Not thrown — every other part of the site (invites, RSVPs, blog...)
  // must keep working even on a deployment that hasn't set these up yet.
  // Only the partner/admin login pages actually call supabase.auth.*, and
  // they'll surface a clear error the moment they try.
  console.warn(
    '[supabaseClient] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set — ' +
      'the Partner Portal login/signup pages will not work until they are.',
  )
}

export const supabase = url && anonKey ? createClient(url, anonKey) : null
