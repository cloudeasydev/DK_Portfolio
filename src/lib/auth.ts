import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

export type AuthPayload = {
  id: string
  email: string
  role: string
}

export function signToken(payload: AuthPayload) {
  return jwt.sign(payload, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' })
}

export function verifyToken(token: string): AuthPayload {
  return jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as AuthPayload
}

export function getAuth(req: NextRequest): AuthPayload | null {
  const header = req.headers.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return null
  try {
    return verifyToken(token)
  } catch {
    return null
  }
}

export function requireAuth(req: NextRequest): AuthPayload {
  const user = getAuth(req)
  if (!user) {
    throw new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  return user
}
