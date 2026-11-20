import { NextRequest } from 'next/server'
import { error, json, requireAdmin, withDb } from '@/lib/api-helpers'
import { Blog } from '@/lib/models'

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, ctx: Ctx) {
  if (!requireAdmin(req)) return error('Unauthorized', 401)
  const { id } = await ctx.params
  try {
    return await withDb(async () => {
      const body = await req.json()
      const visibility = body.visibility === 'public' ? 'public' : 'private'
      const blog = await Blog.findByIdAndUpdate(id, { visibility }, { new: true })
      if (!blog) return error('Not found', 404)
      return json(blog)
    })
  } catch {
    return error('Update failed', 400)
  }
}
