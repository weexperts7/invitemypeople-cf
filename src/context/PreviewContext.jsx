import { createContext } from 'react'

// Lets any page (Home, WeddingsPage, ...) open the full-screen invitation
// preview without prop-drilling through the router — App.jsx owns the
// actual preview state and provides this. See ../hooks/usePreview.js for
// the consuming hook.
const PreviewContext = createContext(() => {})

export default PreviewContext
