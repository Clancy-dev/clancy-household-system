'use client'

import { useState } from 'react'
import { X, ZoomIn } from 'lucide-react'

interface LightboxImageProps {
  src: string
  alt: string
  className?: string
}

interface LightboxProps {
  slides: Array<{ src: string }>
  open: boolean
  onClose: () => void
}

export function Lightbox({ slides, open, onClose }: LightboxProps) {
  return open ? (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <button
        onClick={onClose}
        className="absolute cursor-pointer top-4 right-4 bg-white dark:bg-slate-900 rounded-full p-2 hover:bg-gray-200 dark:hover:bg-slate-800 transition"
      >
        <X size={24} className="text-black dark:text-white" />
      </button>
      {slides.length > 0 && (
        <div className="max-w-4xl max-h-[90vh] flex items-center justify-center">
          <img
            src={slides[0].src}
            alt="Lightbox"
            className="w-full h-full object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  ) : null
}

export function LightboxImage({ src, alt, className = '' }: LightboxImageProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div className={`relative group cursor-pointer inline-block ${className}`} onClick={() => setIsOpen(true)}>
        <img src={src} alt={alt} className="w-full h-full object-cover rounded-md" />
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 rounded-md transition-opacity flex items-center justify-center">
          <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
        </div>
      </div>

      <Lightbox
        slides={[{ src }]}
        open={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}
