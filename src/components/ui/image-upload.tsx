'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2, Upload, X, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  value: string | null
  onChange: (url: string | null) => void
  folder?: string
  label?: string
  type?: 'avatar' | 'cover'
  className?: string
}

export function ImageUpload({
  value,
  onChange,
  folder = 'providers',
  label = 'Upload Image',
  type = 'avatar',
  className,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [configured, setConfigured] = useState<boolean | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const checkConfig = async () => {
    try {
      const res = await fetch('/api/upload')
      const data = await res.json()
      setConfigured(data.configured)
    } catch {
      setConfigured(false)
    }
  }

  useState(() => {
    checkConfig()
  })

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (data.error) {
        if (res.status === 501) {
          toast.error('Image uploads not configured. Using default avatar.')
          setConfigured(false)
        } else {
          toast.error(data.error)
        }
        return
      }

      onChange(data.url)
      toast.success('Image uploaded successfully')
    } catch {
      toast.error('Upload failed. Please try again.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemove = () => {
    onChange(null)
  }

  if (type === 'avatar') {
    return (
      <div className={cn('flex items-center gap-4', className)}>
        <div className="relative">
          <Avatar className="h-20 w-20 border-2 border-background shadow-md">
            {value ? (
              <AvatarImage src={value} alt="Uploaded image" />
            ) : (
              <AvatarFallback className="bg-medical-soft text-primary">
                <ImageIcon className="h-8 w-8" />
              </AvatarFallback>
            )}
          </Avatar>
          {uploading && (
            <div className="absolute inset-0 rounded-full bg-background/80 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
        </div>
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="sr-only"
            id="image-upload-input"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              {value ? 'Change' : 'Upload'}
            </Button>
            {value && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={uploading}
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Remove
              </Button>
            )}
          </div>
          {configured === false && (
            <p className="text-[10px] text-muted-foreground">
              Image uploads not configured. Set Cloudinary env vars in .env
            </p>
          )}
          <p className="text-[10px] text-muted-foreground">
            PNG, JPG up to 5MB. Square images recommended.
          </p>
        </div>
      </div>
    )
  }

  // Cover image upload
  return (
    <div className={cn('space-y-2', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="sr-only"
        id="cover-upload-input"
      />
      <div
        className="relative h-32 rounded-lg border-2 border-dashed border-border bg-muted/30 flex items-center justify-center cursor-pointer hover:border-primary/40 transition-colors overflow-hidden"
        onClick={() => fileInputRef.current?.click()}
      >
        {value ? (
          <>
            <img src={value} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button type="button" variant="secondary" size="sm" disabled={uploading}>
                <Upload className="h-3.5 w-3.5 mr-1" /> Change
              </Button>
              <Button type="button" variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); handleRemove() }} disabled={uploading}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center">
            {uploading ? (
              <Loader2 className="h-6 w-6 mx-auto animate-spin text-primary" />
            ) : (
              <>
                <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                <p className="text-xs text-muted-foreground">Click to upload cover image</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
