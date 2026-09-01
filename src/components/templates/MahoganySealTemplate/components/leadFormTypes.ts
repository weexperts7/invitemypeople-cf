// Shared shape for CreateYourOwnModal.tsx's "Events" list — split out of
// EventDetailsEditor.tsx so that file exports only a component (Vite Fast
// Refresh only reliably hot-reloads files that export components alone;
// mixing in a type + constant there triggers oxlint's
// react(only-export-components) warning).
export interface LeadEvent {
  name: string
  date: string
  time: string
  venue: string
  note: string
}

export const EMPTY_LEAD_EVENT: LeadEvent = { name: '', date: '', time: '', venue: '', note: '' }
