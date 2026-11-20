import { NextRequest } from 'next/server'
import { error, json, requireAdmin, withDb } from '@/lib/api-helpers'
import { Profile } from '@/lib/models'

export async function GET() {
  try {
    return await withDb(async () => {
      const profile = await Profile.findOne().lean()
      return json(profile || {})
    })
  } catch (err) {
    console.error(err)
    return error('Failed to load profile', 500)
  }
}

export async function PUT(req: NextRequest) {
  if (!requireAdmin(req)) return error('Unauthorized', 401)
  try {
    return await withDb(async () => {
      const body = await req.json()
      const existing = await Profile.findOne()
      if (!existing) {
        const created = await Profile.create(body)
        return json(created)
      }
      Object.assign(existing, body)
      await existing.save()
      return json(existing)
    })
  } catch (err) {
    console.error(err)
    return error('Failed to update profile', 500)
  }
}
