// Photo upload widget for the Invitation Builder — see CreateInvitePage.jsx
// and GeneratedInvitePage.jsx (which prefers these over the stock gallery
// once the invite is live). Uploads each selected file immediately, one
// POST /api/photos request per file, so photo URLs are already resolved by
// the time the buyer reaches checkout — the payment step itself never has
// to wait on file uploads. Entirely optional: skipping this leaves
// GeneratedInvitePage to fall back to the template's stock photo set.
//
// `endpoint`/`token` are optional overrides — the B2B Partner Portal's
// client-invite builder (PartnerCreateInvitePage.jsx) reuses this same
// component but points it at its own authenticated
// POST /api/partners/photos (its own `partner-invite-photos` bucket, never
// the consumer one) instead of the default public /api/photos.
import { useRef, useState } from 'react'
import { AlertCircle, ImagePlus, Loader2, X } from 'lucide-react'
import { ALLOWED_MIME_TYPES, MAX_PHOTOS, MAX_PHOTO_BYTES, uploadPhoto } from '../../utils/photoUpload'

let nextItemId = 0

export default function PhotoUploader({ photos, onChange, endpoint = '/api/photos', token }) {
  const [items, setItems] = useState([]) // { id, previewUrl, uploading, error, url }
  const inputRef = useRef(null)

  const uploadedCount = photos.length
  const slotsLeft = MAX_PHOTOS - uploadedCount

  const syncUrls = (nextItems) => onChange(nextItems.filter((it) => it.url).map((it) => it.url))

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList).slice(0, slotsLeft)

    for (const file of files) {
      const id = nextItemId++
      const previewUrl = URL.createObjectURL(file)

      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        setItems((prev) => [
          ...prev,
          { id, previewUrl, uploading: false, error: 'Unsupported file type', url: null },
        ])
        continue
      }

      // Server-side (formidable, both api/photos.js and its local-dev
      // counterpart in server/index.js) enforces this same MAX_PHOTO_BYTES
      // limit, but aborts the connection mid-upload rather than finishing
      // the request when it's exceeded — the browser then sees that as a
      // bare "Failed to fetch" network error, not the friendly "file is
      // too large" message the server actually intends. Checking here,
      // before a single byte is ever sent, is what avoids that entirely —
      // exactly what this constant's own doc comment (photoUpload.js) says
      // this component already does.
      if (file.size > MAX_PHOTO_BYTES) {
        setItems((prev) => [
          ...prev,
          { id, previewUrl, uploading: false, error: 'File is too large (max 4MB)', url: null },
        ])
        continue
      }

      setItems((prev) => [...prev, { id, previewUrl, uploading: true, error: null, url: null }])

      try {
        const url = await uploadPhoto(file, { endpoint, token })

        setItems((prev) => {
          const next = prev.map((it) =>
            it.id === id ? { ...it, uploading: false, url } : it,
          )
          syncUrls(next)
          return next
        })
      } catch (err) {
        console.error('[PhotoUploader] upload failed:', err)
        setItems((prev) =>
          prev.map((it) =>
            it.id === id ? { ...it, uploading: false, error: err.message || 'Upload failed' } : it,
          ),
        )
      }
    }
  }

  const handleRemove = (id) => {
    setItems((prev) => {
      const next = prev.filter((it) => it.id !== id)
      syncUrls(next)
      return next
    })
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="relative aspect-square overflow-hidden rounded-xl border border-champagne-deep/50 bg-champagne/30"
          >
            {item.previewUrl && (
              <img src={item.previewUrl} alt="" className="h-full w-full object-cover" />
            )}
            {item.uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-ink/40">
                <Loader2 className="h-5 w-5 animate-spin text-ivory" />
              </div>
            )}
            {item.error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-rose/80 p-1 text-center text-[10px] leading-tight text-ivory">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {item.error}
              </div>
            )}
            <button
              type="button"
              onClick={() => handleRemove(item.id)}
              aria-label="Remove photo"
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink/70 text-ivory"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {slotsLeft > 0 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-champagne-deep/60 text-ink-soft transition-colors hover:border-gold-soft hover:text-ink"
          >
            <ImagePlus className="h-5 w-5" />
            <span className="text-[10px] uppercase tracking-wide">Add Photo</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files)
          e.target.value = '' // lets the same file be re-selected after a remove
        }}
      />

      <p className="mt-2 text-xs text-ink-soft">
        Up to {MAX_PHOTOS} photos, JPEG/PNG/WebP, 4MB each. Optional — skip
        this and we&rsquo;ll use a matching stock photo set instead.
      </p>
    </div>
  )
}
