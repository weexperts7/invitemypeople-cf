// Lazily injects Razorpay's Checkout.js widget script — only the page that
// actually opens a checkout (see PaymentModal.jsx) pays for it, instead of
// every page loading a third-party script it'll never use. Cached so a
// second checkout in the same session doesn't re-inject the tag.
const SRC = 'https://checkout.razorpay.com/v1/checkout.js'

let loadPromise = null

export function loadRazorpayCheckout() {
  if (typeof window !== 'undefined' && window.Razorpay) return Promise.resolve()
  if (loadPromise) return loadPromise

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${SRC}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay Checkout')))
      return
    }

    const script = document.createElement('script')
    script.src = SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Razorpay Checkout'))
    document.body.appendChild(script)
  }).catch((err) => {
    loadPromise = null // let the next attempt retry instead of staying rejected forever
    throw err
  })

  return loadPromise
}
