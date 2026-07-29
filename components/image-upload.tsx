'use client'

import { useState, useCallback } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  label?: string
  disabled?: boolean
}

export function ImageUpload({
  value,
  onChange,
  label = 'Upload Image',
  disabled = false,
}: ImageUploadProps) {
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)

  const handleUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      setLoading(true)
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', 'expense_tracker') // You'll need to set this in Cloudinary

        const response = await fetch(process.env.NEXT_PUBLIC_CLOUDINARY_URL || '', {
          method: 'POST',
          body: formData,
        })

        const data = await response.json()

        if (data.secure_url) {
          setPreview(data.secure_url)
          onChange(data.secure_url)
        }
      } catch (error) {
        console.error('[ImageUpload] Error:', error)
      } finally {
        setLoading(false)
      }
    },
    [onChange]
  )

  const handleRemove = () => {
    setPreview(null)
    onChange('')
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      
      {preview ? (
        <div className="relative w-full h-48 rounded-lg border border-border overflow-hidden bg-muted">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled || loading}
            className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <label
          className={`flex items-center justify-center w-full h-48 rounded-lg border-2 border-dashed border-border transition cursor-pointer ${
            disabled || loading
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:border-primary hover:bg-primary/5'
          }`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={disabled || loading}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center gap-2 py-6">
            {loading ? (
              <>
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </>
            ) : (
              <>
                <Upload className="text-muted-foreground" size={32} />
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">Click to upload image</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                </div>
              </>
            )}
          </div>
        </label>
      )}
    </div>
  )
}
