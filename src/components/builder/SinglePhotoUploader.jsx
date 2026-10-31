// One optional photo for the Invitation Builder: a person's portrait in
// "Family Details" (`shape="arch"`, on templates with `hasPortraits` in
// data/builderTemplates.js) or a venue's picture (`shape="wide"`, on templates
// with `hasVenuePhotos`). Uploads as soon as a file is picked, same as
// PhotoUploader.jsx.
import { useRef, useState } from 'react'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { ALLOWED_MIME_TYPES, MAX_PHOTO_BYTES, uploadPhoto } from '../../utils/photoUpload'

const SHAPES = {
  arch: { box: 'h-20 w-16', corners: 'rounded-t-full rounded-b-lg', crop: 'object-[50%_20%]' },
  wide: { box: 'h-16 w-28', corners: 'rounded-lg', crop: 'object-center' },
}

export default function SinglePhotoUploader({ label, hint, url, onChange, shape = 'arch' }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)
  const { box, corners, crop } = SHAPES[shape]

  const handleFile = async (file) => {
    setError(null)
    if (!ALLOWED_MIME_TYPES.includes(file.type)) return setError('Please use a JPEG, PNG or WebP photo')
    if (file.size > MAX_PHOTO_BYTES) return setError('File is too large (max 4MB)')

    setUploading(true)
    try {
      onChange(await uploadPhoto(file))
    } catch (err) {
      console.error('[SinglePhotoUploader] upload failed:', err)
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div className={`relative shrink-0 ${box}`}>
        {url ? (
          <img
            src={url}
            alt={`${label} preview`}
            className={`h-full w-full border border-gold-soft object-cover ${corners} ${crop}`}
          />
        ) : (
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            aria-label={`Upload ${label}`}
            className={`flex h-full w-full cursor-pointer items-center justify-center border-2 border-dashed border-champagne-deep/60 text-ink-soft transition-colors hover:border-gold-soft hover:text-ink disabled:cursor-not-allowed disabled:opacity-50 ${corners}`}
          >
            {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
          </button>
        )}
        {url && (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label={`Remove ${label}`}
            className="absolute -right-1.5 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink/70 text-ivory"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="min-w-0 text-xs">
        <p className="uppercase tracking-[0.15em] text-ink-soft">{label}</p>
        <p className={`mt-1 ${error ? 'text-rose' : 'text-ink-soft/70'}`}>{error || hint}</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) handleFile(e.target.files[0])
          e.target.value = '' // lets the same file be re-selected after a remove
        }}
      />
    </div>
  )
}
