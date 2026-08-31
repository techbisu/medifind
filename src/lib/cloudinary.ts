import { v2 as cloudinary } from 'cloudinary'

/**
 * Cloudinary configuration.
 * Set these env vars in .env:
 *   CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 *   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME (for client-side upload widget)
 */
let isConfigured = false

try {
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    })
    isConfigured = true
  }
} catch (e) {
  console.error('Cloudinary config error:', e)
}

export { cloudinary }

export const isCloudinaryConfigured = isConfigured

export const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || ''

/**
 * Upload a file buffer to Cloudinary.
 * Returns the secure URL of the uploaded image.
 */
export async function uploadToCloudinary(
  file: Buffer,
  options: {
    folder?: string
    public_id?: string
    transformation?: string
  } = {}
): Promise<{ url: string; publicId: string }> {
  if (!isConfigured) {
    throw new Error('Cloudinary not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env')
  }

  return new Promise((resolve, reject) => {
    const uploadOptions: any = {
      folder: options.folder || 'medifind',
      resource_type: 'image',
      overwrite: true,
    }
    if (options.public_id) uploadOptions.public_id = options.public_id
    if (options.transformation) uploadOptions.transformation = options.transformation

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error)
          return
        }
        resolve({
          url: result?.secure_url || '',
          publicId: result?.public_id || '',
        })
      }
    )
    uploadStream.end(file)
  })
}

/**
 * Delete an image from Cloudinary by public ID.
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  if (!isConfigured) return false
  try {
    await cloudinary.uploader.destroy(publicId)
    return true
  } catch (e) {
    console.error('Cloudinary delete failed:', e)
    return false
  }
}
