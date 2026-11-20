import { NextRequest } from 'next/server'
import { error, json, requireAdmin, withDb } from '@/lib/api-helpers'
import { Media } from '@/lib/models'

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) return error('Unauthorized', 401)
  try {
    return await withDb(async () => {
      const form = await req.formData()
      const file = form.get('file')
      if (!file || !(file instanceof File)) return error('No file uploaded')
      const buffer = Buffer.from(await file.arrayBuffer())
      if (buffer.length > 8 * 1024 * 1024) return error('File too large (max 8MB)')
      const media = await Media.create({
        filename: file.name,
        contentType: file.type || 'application/octet-stream',
        size: buffer.length,
        data: buffer,
      })
      return json(
        {
          id: media._id,
          url: `/api/media/${media._id}`,
          filename: media.filename,
          contentType: media.contentType,
        },
        201,
      )
    })
  } catch (err) {
    console.error(err)
    return error('Upload failed', 500)
  }
}
