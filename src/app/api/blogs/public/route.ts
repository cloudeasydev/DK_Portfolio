import { error, json, withDb } from '@/lib/api-helpers'
import { Blog } from '@/lib/models'

export async function GET() {
  try {
    return await withDb(async () => {
      const blogs = await Blog.find({ visibility: 'public' })
        .sort({ date: -1, createdAt: -1 })
        .lean()
      return json(blogs)
    })
  } catch (err) {
    console.error(err)
    return error('Failed to load blogs', 500)
  }
}
