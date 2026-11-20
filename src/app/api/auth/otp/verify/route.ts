import { NextRequest } from 'next/server'
import { signToken } from '@/lib/auth'
import { error, json, withDb } from '@/lib/api-helpers'
import { findAdminUser, verifyStoredOtp } from '@/lib/otp'

export async function POST(req: NextRequest) {
  try {
    return await withDb(async () => {
      const body = await req.json()
      const email = String(body.email || '')
        .toLowerCase()
        .trim()
      const code = String(body.code || body.otp || '')

      const user = await findAdminUser(email)
      if (!user) {
        return error('This email is not authorized for admin access', 403)
      }

      try {
        await verifyStoredOtp(email, code)
      } catch (verifyErr) {
        return error(verifyErr instanceof Error ? verifyErr.message : 'Invalid code', 401)
      }

      const token = signToken({
        id: user._id.toString(),
        email: user.email,
        role: user.role || 'admin',
      })

      return json({ token, email: user.email })
    })
  } catch (err) {
    console.error(err)
    return error('OTP verification failed', 500)
  }
}
