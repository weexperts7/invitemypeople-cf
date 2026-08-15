import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../utils/supabaseClient'
import { getMyProfile } from '../utils/partnerApi'

// Session + partner-profile state for everything under /partners/* and
// /admin/* — see PartnerPortalLayout.jsx (the only place this Provider is
// mounted) and ../hooks/usePartnerAuth.js for the consuming hook. Kept out
// of the rest of the app since public pages have no reason to check a
// Supabase Auth session on every load.
const PartnerAuthContext = createContext(null)

export function PartnerAuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [partner, setPartner] = useState(null)
  // Distinguishes "no partner row for this login" (expected for an
  // admin-only account) from an actual fetch failure — AdminPartnersPage
  // doesn't need `partner` at all, so it never surfaces this; only
  // PartnerOverviewPage cares.
  const [profileError, setProfileError] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (accessToken) => {
    if (!accessToken) {
      setPartner(null)
      setProfileError(null)
      return
    }
    try {
      const { partner: p } = await getMyProfile(accessToken)
      setPartner(p)
      setProfileError(null)
    } catch (err) {
      setPartner(null)
      setProfileError(err.message)
    }
  }, [])

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return undefined
    }

    let cancelled = false

    supabase.auth.getSession().then(async ({ data }) => {
      if (cancelled) return
      setSession(data.session)
      await loadProfile(data.session?.access_token)
      if (!cancelled) setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      loadProfile(nextSession?.access_token)
    })

    return () => {
      cancelled = true
      listener.subscription.unsubscribe()
    }
  }, [loadProfile])

  const signIn = useCallback(
    async (email, password) => {
      if (!supabase) throw new Error('This deployment is not configured for partner login.')
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      setSession(data.session)
      await loadProfile(data.session?.access_token)
      return data.session
    },
    [loadProfile],
  )

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setSession(null)
    setPartner(null)
  }, [])

  const refreshProfile = useCallback(
    () => loadProfile(session?.access_token),
    [loadProfile, session],
  )

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      accessToken: session?.access_token ?? null,
      partner,
      profileError,
      loading,
      signIn,
      signOut,
      refreshProfile,
    }),
    [session, partner, profileError, loading, signIn, signOut, refreshProfile],
  )

  return <PartnerAuthContext.Provider value={value}>{children}</PartnerAuthContext.Provider>
}

export default PartnerAuthContext
