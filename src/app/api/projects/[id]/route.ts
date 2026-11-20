import { NextRequest } from 'next/server'
import { error, json, parseTags, requireAdmin, withDb } from '@/lib/api-helpers'
import { Project } from '@/lib/models'

function normalizeProject(body: Record<string, unknown>) {
  return {
    title: String(body.title || ''),
    summary: String(body.summary || ''),
    tags: parseTags(body.tags),
    url: String(body.url || ''),
    featured: Boolean(body.featured),
    date: String(body.date || ''),
    imageUrl: String(body.imageUrl || ''),
  }
}

type Ctx = { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, ctx: Ctx) {
  if (!requireAdmin(req)) return error('Unauthorized', 401)
  const { id } = await ctx.params
  try {
    return await withDb(async () => {
      const body = await req.json()
      const project = await Project.findByIdAndUpdate(id, normalizeProject(body), {
        new: true,
        runValidators: true,
      })
      if (!project) return error('Not found', 404)
      return json(project)
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
      const project = await Project.findByIdAndDelete(id)
      if (!project) return error('Not found', 404)
      return json({ ok: true })
    })
  } catch {
    return error('Delete failed', 400)
  }
}
