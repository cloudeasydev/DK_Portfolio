import { NextRequest } from 'next/server'
import { error, requireAdmin, withDb } from '@/lib/api-helpers'
import { Media } from '@/lib/models'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  try {
    return await withDb(async () => {
      const media = await Media.findById(id)
      if (!media || !media.data) return error('Not found', 404)
      return new Response(new Uint8Array(media.data), {
        headers: {
          'Content-Type': media.contentType || 'application/octet-stream',
          'Cache-Control': 'public, max-age=31536000',
        },
      })
    })
  } catch {
    return error('Not found', 404)
  }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  if (!requireAdmin(req)) return error('Unauthorized', 401)
  const { id } = await ctx.params
  try {
    return await withDb(async () => {
      await Media.findByIdAndDelete(id)
      return Response.json({ ok: true })
    })
  } catch {
    return error('Delete failed', 400)
  }
}
