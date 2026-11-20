import { NextRequest } from 'next/server'
import { getAuth } from '@/lib/auth'
import { error, json } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  const user = getAuth(req)
  if (!user) return error('Unauthorized', 401)
  return json({ email: user.email, role: user.role })
}
