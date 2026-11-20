import { NextRequest } from 'next/server'
import { error, json, parseTags, requireAdmin, withDb } from '@/lib/api-helpers'
import { Blog } from '@/lib/models'

function normalizeBlog(body: Record<string, unknown>) {
  return {
    title: String(body.title || ''),
    summary: String(body.summary || ''),
    content: String(body.content || ''),
    venue: String(body.venue || ''),
    date: String(body.date || ''),
    tags: parseTags(body.tags),
    featured: Boolean(body.featured),
    visibility: body.visibility === 'public' ? 'public' : 'private',
    links: Array.isArray(body.links) ? body.links : [],
    imageUrl: String(body.imageUrl || ''),
  }
}

type Ctx = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, ctx: Ctx) {
  if (!requireAdmin(req)) return error('Unauthorized', 401)
  const { id } = await ctx.params
  try {
    return await withDb(async () => {
      const blog = await Blog.findById(id).lean()
      if (!blog) return error('Not found', 404)
      return json(blog)
    })
  } catch {
    return error('Not found', 404)
  }
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  if (!requireAdmin(req)) return error('Unauthorized', 401)
  const { id } = await ctx.params
  try {
    return await withDb(async () => {
      const body = await req.json()
      const blog = await Blog.findByIdAndUpdate(id, normalizeBlog(body), {
        new: true,
        runValidators: true,
      })
      if (!blog) return error('Not found', 404)
      return json(blog)
    })
  } catch (err) {
    console.error(err)
    return error('Update failed', 400)
  }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  if (!requireAdmin(req)) return error('Unauthorized', 401)
  const { id } = await ctx.params
  try {
    return await withDb(async () => {
      const blog = await Blog.findByIdAndDelete(id)
      if (!blog) return error('Not found', 404)
      return json({ ok: true })
    })
  } catch {
    return error('Delete failed', 400)
  }
}
