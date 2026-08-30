// Local ambient declaration so this directory's .css side-effect import
// type-checks in isolation. Vite already handles CSS imports for the actual
// build — this file exists purely so `tsc --noEmit` (or an editor's TS
// language service) doesn't complain when it has no project-wide
// `vite/client` types to fall back on. Scoped to this template only; it
// does not touch or replace any global type declarations.
declare module '*.css'
