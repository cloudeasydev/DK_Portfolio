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

export async function GET() {
  try {
    return await withDb(async () => {
      const projects = await Project.find().sort({ date: -1, createdAt: -1 }).lean()
      return json(projects)
    })
  } catch (err) {
    console.error(err)
    return error('Failed to load projects', 500)
  }
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) return error('Unauthorized', 401)
  try {
    return await withDb(async () => {
      const body = await req.json()
      const project = await Project.create(normalizeProject(body))
      return json(project, 201)
    })
  } catch (err) {
    console.error(err)
    return error('Create failed', 400)
  }
}
