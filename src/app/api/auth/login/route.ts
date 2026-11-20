import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'
import { signToken } from '@/lib/auth'
import { error, json, withDb } from '@/lib/api-helpers'
import { User } from '@/lib/models'

export async function POST(req: NextRequest) {
  try {
    return await withDb(async () => {
      const body = await req.json()
      const email = String(body.email || '')
        .toLowerCase()
        .trim()
      const password = String(body.password || '')
      const user = await User.findOne({ email })
      if (!user) return error('Invalid email or password', 401)
      const ok = await bcrypt.compare(password, user.passwordHash)
      if (!ok) return error('Invalid email or password', 401)
      const token = signToken({
        id: user._id.toString(),
        email: user.email,
        role: user.role || 'admin',
      })
      return json({ token, email: user.email })
    })
  } catch (err) {
    console.error(err)
    return error('Login failed', 500)
  }
}
