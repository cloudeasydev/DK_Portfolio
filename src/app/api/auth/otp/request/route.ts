import { NextRequest } from 'next/server'
import { error, json, withDb } from '@/lib/api-helpers'
import { sendOtpEmail } from '@/lib/mailer'
import { createAndStoreOtp, findAdminUser } from '@/lib/otp'

export async function POST(req: NextRequest) {
  try {
    return await withDb(async () => {
      const body = await req.json()
      const email = String(body.email || '')
        .toLowerCase()
        .trim()

      if (!email || !email.includes('@')) {
        return error('Enter a valid email address', 400)
      }

      const user = await findAdminUser(email)
      if (!user) {
        return error('This email is not authorized for admin access', 403)
      }

      const { code } = await createAndStoreOtp(email)

      try {
        await sendOtpEmail(email, code)
      } catch (mailErr) {
        console.error(mailErr)
        return error(
          mailErr instanceof Error ? mailErr.message : 'Failed to send OTP email. Check SMTP settings.',
          500,
        )
      }

      return json({
        ok: true,
        email,
        message: 'OTP sent to your email',
        expiresInSec: 600,
      })
    })
  } catch (err) {
    console.error(err)
    const message = err instanceof Error ? err.message : 'Failed to send OTP'
    const status = message.includes('wait') ? 429 : 500
    return error(message, status)
  }
}
