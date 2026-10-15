// Vite's build always emits dist/index.html — and that literal filename is
// exactly what both Cloudflare Pages' static-asset layer and Express's
// `express.static` (server/index.js) treat as the implicit document for a
// request to "/". That static match wins over Cloudflare's catch-all
// routing to functions/[[path]].js (Pages Functions only run when no
// matching static file already exists) and, locally, over express.static's
// own serve-index-for-directory default — so a request for "/" bypassed the
// per-route <h1>/meta injection entirely and served the raw, route-agnostic
// shell. Every OTHER route (/weddings, /about, ...) has no corresponding
// static file in dist/, so those already fell through to the render
// pipeline correctly; "/" was the one exception, which is also the single
// most important page for this to work on.
//
// Renaming the built file removes that literal "index.html" match: dist/
// then has nothing that can satisfy "/" (or "/index.html") on its own, so
// every request — including "/" — falls through to functions/[[path]].js
// (production) or server/index.js's renderSeoHtml catch-all (local
// `npm start`), both of which already read this same renamed file as their
// shared HTML template (see getIndexHtmlTemplate() in each).
import { renameSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dist = path.resolve(__dirname, '..', 'dist')

renameSync(path.join(dist, 'index.html'), path.join(dist, 'app-shell.html'))
