import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { OtpChallenge, User } from './models'

const OTP_TTL_MS = 10 * 60 * 1000
const RESEND_COOLDOWN_MS = 60 * 1000
const MAX_ATTEMPTS = 5

export function generateOtpCode() {
  return String(crypto.randomInt(100000, 1000000))
}

export async function findAdminUser(email: string) {
  const normalized = email.toLowerCase().trim()
  const allowed = (process.env.ADMIN_EMAIL || '').toLowerCase().trim()
  if (allowed && normalized !== allowed) return null

  let user = await User.findOne({ email: normalized })
  if (!user && allowed && normalized === allowed) {
    // Ensure production admin exists even if seed was never run
    user = await User.create({
      email: normalized,
      passwordHash: await bcrypt.hash(crypto.randomBytes(24).toString('hex'), 10),
      role: 'admin',
    })
  }
  return user
}

export async function createAndStoreOtp(email: string) {
  const normalized = email.toLowerCase().trim()
  const existing = await OtpChallenge.findOne({ email: normalized }).sort({ createdAt: -1 })
  if (existing) {
    const age = Date.now() - new Date(existing.createdAt).getTime()
    if (age < RESEND_COOLDOWN_MS) {
      const waitSec = Math.ceil((RESEND_COOLDOWN_MS - age) / 1000)
      throw new Error(`Please wait ${waitSec}s before requesting another code`)
    }
  }

  const code = generateOtpCode()
  const codeHash = await bcrypt.hash(code, 10)
  const expiresAt = new Date(Date.now() + OTP_TTL_MS)

  await OtpChallenge.deleteMany({ email: normalized })
  await OtpChallenge.create({
    email: normalized,
    codeHash,
    expiresAt,
    attempts: 0,
  })

  return { code, expiresAt }
}

export async function verifyStoredOtp(email: string, code: string) {
  const normalized = email.toLowerCase().trim()
  const otp = String(code || '').replace(/\D/g, '')
  if (!/^\d{6}$/.test(otp)) {
    throw new Error('Enter the 6-digit code')
  }

  const challenge = await OtpChallenge.findOne({ email: normalized }).sort({ createdAt: -1 })
  if (!challenge) throw new Error('No active code. Request a new one.')
  if (challenge.expiresAt.getTime() < Date.now()) {
    await OtpChallenge.deleteMany({ email: normalized })
    throw new Error('Code expired. Request a new one.')
  }
  if (challenge.attempts >= MAX_ATTEMPTS) {
    await OtpChallenge.deleteMany({ email: normalized })
    throw new Error('Too many attempts. Request a new code.')
  }

  const ok = await bcrypt.compare(otp, challenge.codeHash)
  if (!ok) {
    challenge.attempts += 1
    await challenge.save()
    const left = MAX_ATTEMPTS - challenge.attempts
    throw new Error(left > 0 ? `Invalid code. ${left} attempts left.` : 'Too many attempts. Request a new code.')
  }

  await OtpChallenge.deleteMany({ email: normalized })
  return true
}
