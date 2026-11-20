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

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return error('Unauthorized', 401)
  try {
    return await withDb(async () => {
      const blogs = await Blog.find().sort({ updatedAt: -1 }).lean()
      return json(blogs)
    })
  } catch (err) {
    console.error(err)
    return error('Failed to load blogs', 500)
  }
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) return error('Unauthorized', 401)
  try {
    return await withDb(async () => {
      const body = await req.json()
      const blog = await Blog.create(normalizeBlog(body))
      return json(blog, 201)
    })
  } catch (err) {
    console.error(err)
    return error('Create failed', 400)
  }
}
