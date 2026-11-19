import { createContext, useContext } from 'react'

// True inside a public template demo page (/templates/wedding/:id,
// /satsang/:slug, /templates/ganesh-chaturthi/:slug). Those pages show sample
// names such as "Aarav & Diya", and the page's own H1 is the template's name
// further down (see TemplatePageContent.jsx), so the sample names must not be
// headings there. A real invitation (/i/:slug) and the builder preview keep
// them as headings.
export const DemoPageContext = createContext(false)

export function useIsDemoPage() {
  return useContext(DemoPageContext)
}
