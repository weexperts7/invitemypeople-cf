import { useRef, useState } from 'react'

import { ALLOWED_MIME_TYPES, MAX_PHOTO_BYTES } from '../../../../utils/photoUpload'

interface UploadItem {
  id: number
  previewUrl: string
  uploading: boolean
  error: string | null
  url: string | null
}

interface MstPhotoUploaderProps {
  /** Confirmed (uploaded) photo URLs — controlled from the parent form. */
  photos: string[]
  onChange: (urls: string[]) => void
  /** How many photos this slot accepts. 1 renders a single square tile; >1 renders a grid + "add" tile. */
  max?: number
  /** Short caption under the tiles, e.g. "Up to 6 photos, JPEG/PNG/WebP, 4MB each." */
  hint?: string
}

let nextItemId = 0

/**
 * A small, self-contained multi-photo uploader scoped to
 * MahoganySealTemplate's own gold-on-mahogany palette — used by
 * CreateYourOwnModal.tsx for both the gallery strip (max=6) and the two
 * individual couple portraits (max=1 each).
 *
 * Deliberately its own component rather than reusing
 * `src/components/builder/PhotoUploader.jsx`: that one is themed in the
 * site's shared ivory/rose palette, which would look visibly out of place
 * inside this template's dark mahogany dashboard — this template's own
 * README is explicit that nothing here should depend on the shared app
 * theme. The upload mechanics are identical: one immediate
 * `POST /api/photos` per file, same shared `ALLOWED_MIME_TYPES`/
 * `MAX_PHOTO_BYTES` constants everything else in the app already uses, so
 * a URL is already resolved by the time the lead is submitted.
 */
export default function MstPhotoUploader({ photos, onChange, max = 6, hint }: MstPhotoUploaderProps) {
  const [items, setItems] = useState<UploadItem[]>([])
  const inputRef = useRef<HTMLInputElement | null>(null)

  const slotsLeft = max - photos.length

  const syncUrls = (nextItems: UploadItem[]) =>
    onChange(nextItems.filter((it) => it.url).map((it) => it.url as string))

  const handleFiles = async (fileList: FileList) => {
    const files = Array.from(fileList).slice(0, Math.max(0, slotsLeft))

    for (const file of files) {
      const id = nextItemId++
      const previewUrl = URL.createObjectURL(file)

      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        setItems((prev) => [...prev, { id, previewUrl, uploading: false, error: 'Unsupported file type', url: null }])
        continue
      }
      if (file.size > MAX_PHOTO_BYTES) {
        setItems((prev) => [...prev, { id, previewUrl, uploading: false, error: 'File is too large (max 4MB)', url: null }])
        continue
      }

      setItems((prev) => [...prev, { id, previewUrl, uploading: true, error: null, url: null }])

      try {
        const formData = new FormData()
        formData.append('photo', file)
        const res = await fetch('/api/photos', { method: 'POST', body: formData })
        const result = await res.json().catch(() => null)
        if (!res.ok || !result?.ok) throw new Error(result?.error || 'Upload failed')

        setItems((prev) => {
          const next = prev.map((it) => (it.id === id ? { ...it, uploading: false, url: result.url } : it))
          syncUrls(next)
          return next
        })
      } catch (err) {
        console.error('[MstPhotoUploader] upload failed:', err)
        setItems((prev) =>
          prev.map((it) => (it.id === id ? { ...it, uploading: false, error: (err as Error).message || 'Upload failed' } : it)),
        )
      }
    }
  }

  const handleRemove = (id: number) => {
    setItems((prev) => {
      const next = prev.filter((it) => it.id !== id)
      syncUrls(next)
      return next
    })
  }

  return (
    <div>
      <div className={`grid gap-3 ${max === 1 ? 'grid-cols-1 max-w-[120px]' : 'grid-cols-3 sm:grid-cols-4'}`}>
        {items.map((item) => (
          <div
            key={item.id}
            className="relative aspect-square overflow-hidden rounded-lg border border-[#d4af37]/30 bg-[#1a100d]/40"
          >
            {item.previewUrl && <img src={item.previewUrl} alt="" className="h-full w-full object-cover" />}
            {item.uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#1a100d]/60">
                <span className="mst-font-seal text-[9px] tracking-[0.1em] text-[#f2d675] uppercase">Uploading…</span>
              </div>
            )}
            {item.error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-[#8b1e1e]/85 p-1 text-center text-[9px] leading-tight text-[#fbf3e3]">
                {item.error}
              </div>
            )}
            <button
              type="button"
              onClick={() => handleRemove(item.id)}
              aria-label="Remove photo"
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#1a100d]/80 text-xs leading-none text-[#fbf3e3]"
            >
              &times;
            </button>
          </div>
        ))}

        {slotsLeft > 0 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-[#d4af37]/40 text-[#d4af37]/80 transition-colors hover:border-[#d4af37] hover:text-[#d4af37]"
          >
            <span className="text-lg leading-none">+</span>
            <span className="mst-font-seal text-[8px] tracking-[0.1em] uppercase">Add</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={max > 1}
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files)
          e.target.value = ''
        }}
      />

      {/* `font-sans` rather than the inherited decorative `.mst-root` serif
          — matches every other caption/hint on the page (see
          MahoganySealCreatePage.tsx's own comment on `inputClasses`), so
          this doesn't read as a different, smaller-looking type style next
          to them. */}
      {hint && <p className="mt-2 font-sans text-xs text-[#8a6a1f]">{hint}</p>}
    </div>
  )
}
