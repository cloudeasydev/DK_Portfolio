import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from './auth'
import { ensureDb } from './seed'

export async function withDb<T>(fn: () => Promise<T>) {
  await ensureDb()
  return fn()
}

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status })
}

export function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export function requireAdmin(req: NextRequest) {
  const user = getAuth(req)
  if (!user) return null
  return user
}

export function parseTags(tags: unknown): string[] {
  if (Array.isArray(tags)) return tags.map(String)
  return String(tags || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
}
