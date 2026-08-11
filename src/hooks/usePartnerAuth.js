import { useContext } from 'react'
import PartnerAuthContext from '../context/PartnerAuthContext'

export function usePartnerAuth() {
  const ctx = useContext(PartnerAuthContext)
  if (!ctx) {
    throw new Error('usePartnerAuth must be used within a PartnerAuthProvider (see PartnerPortalLayout)')
  }
  return ctx
}
