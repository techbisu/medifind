import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { uploadToCloudinary, isCloudinaryConfigured } from '@/lib/cloudinary'

/**
 * POST /api/upload
 * Upload an image to Cloudinary. Requires authentication.
 *
 * Body: FormData with 'file' field (image) and optional 'folder' field.
 * Returns: { url, publicId }
 *
 * If Cloudinary is not configured, returns 501 with helpful message.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    if (!isCloudinaryConfigured) {
      return NextResponse.json(
        {
          error: 'Image uploads not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env',
          configured: false,
        },
        { status: 501 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'medifind'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const result = await uploadToCloudinary(buffer, {
      folder: `medifind/${folder}`,
    })

    return NextResponse.json(
      { url: result.url, publicId: result.publicId },
      { status: 201 }
    )
  } catch (e) {
    console.error('Upload error:', e)
    return NextResponse.json(
      { error: 'Upload failed. Please try again.' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/upload — check if uploads are configured.
 */
export async function GET() {
  return NextResponse.json({ configured: isCloudinaryConfigured })
}
