import { useRef } from 'react'
import { Upload, X } from 'lucide-react'

interface ImageUploadProps {
  value?: string
  onChange: (base64: string) => void
  onClear?: () => void
  label?: string
  required?: boolean
  hint?: string
  previewHeight?: string
}

export function ImageUpload({ value, onChange, onClear, label, required, hint, previewHeight = 'h-36' }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => onChange(reader.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div>
      {label && (
        <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">
          {label}{required && ' *'}
          {hint && <span className="ml-1 font-normal opacity-70">{hint}</span>}
        </label>
      )}
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      {value ? (
        <div className="relative inline-block w-full">
          <img src={value} alt="Uploaded" className={`w-full ${previewHeight} object-cover rounded-xl`} />
          <button
            type="button"
            onClick={() => { onClear?.(); if (inputRef.current) inputRef.current.value = '' }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 flex items-center justify-center text-white hover:bg-black/90 transition-all"
          >
            <X size={13} />
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/70 text-white text-xs font-medium hover:bg-black/90 transition-all"
          >
            Change
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`w-full ${previewHeight} rounded-xl border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center gap-2 text-[var(--muted-foreground)] hover:border-[var(--accent)]/50 hover:bg-[var(--accent)]/5 hover:text-white transition-all`}
        >
          <Upload size={20} />
          <span className="text-xs">Click to upload image</span>
        </button>
      )}
    </div>
  )
}

interface MultiImageUploadProps {
  values: string[]
  onChange: (images: string[]) => void
  label?: string
  hint?: string
  max?: number
}

export function MultiImageUpload({ values, onChange, label, hint, max = 10 }: MultiImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const readers = files.slice(0, max - values.length).map(file => {
      return new Promise<string>(resolve => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })
    })
    Promise.all(readers).then(results => {
      onChange([...values, ...results])
      if (inputRef.current) inputRef.current.value = ''
    })
  }

  function remove(idx: number) {
    onChange(values.filter((_, i) => i !== idx))
  }

  return (
    <div>
      {label && (
        <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">
          {label}
          {hint && <span className="ml-1 font-normal opacity-70">{hint}</span>}
        </label>
      )}
      <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
      <div className="grid grid-cols-3 gap-2">
        {values.map((src, i) => (
          <div key={i} className="relative">
            <img src={src} alt={`Photo ${i + 1}`} className="w-full h-24 object-cover rounded-xl" />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center text-white hover:bg-black/90 transition-all"
            >
              <X size={10} />
            </button>
          </div>
        ))}
        {values.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="h-24 rounded-xl border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center gap-1.5 text-[var(--muted-foreground)] hover:border-[var(--accent)]/50 hover:bg-[var(--accent)]/5 hover:text-white transition-all"
          >
            <Upload size={16} />
            <span className="text-[10px]">Add photo</span>
          </button>
        )}
      </div>
    </div>
  )
}
