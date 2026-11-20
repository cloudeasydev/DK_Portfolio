'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { api } from '@/api/client'
import { useAdminAuth } from './AdminAuth'

type Step = 'email' | 'otp'

export function AdminLogin() {
  const { email, ready, loginWithOtp } = useAdminAuth()
  const router = useRouter()
  const [step, setStep] = useState<Step>('email')
  const [mail, setMail] = useState('')
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    if (ready && email) router.replace('/admin')
  }, [ready, email, router])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = window.setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => window.clearTimeout(t)
  }, [cooldown])

  async function sendOtp(e?: FormEvent) {
    e?.preventDefault()
    setError('')
    setBusy(true)
    try {
      const res = await api.requestOtp(mail)
      setMail(res.email)
      setStep('otp')
      setDigits(['', '', '', '', '', ''])
      setCooldown(60)
      window.setTimeout(() => inputsRef.current[0]?.focus(), 50)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP')
    } finally {
      setBusy(false)
    }
  }

  async function verifyOtp(codeOverride?: string) {
    const code = codeOverride || digits.join('')
    if (!/^\d{6}$/.test(code)) {
      setError('Enter the 6-digit code')
      return
    }
    setError('')
    setBusy(true)
    try {
      await loginWithOtp(mail, code)
      router.replace('/admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP')
      setDigits(['', '', '', '', '', ''])
      window.setTimeout(() => inputsRef.current[0]?.focus(), 50)
    } finally {
      setBusy(false)
    }
  }

  function onDigitChange(index: number, value: string) {
    const clean = value.replace(/\D/g, '')
    if (!clean) {
      const next = [...digits]
      next[index] = ''
      setDigits(next)
      return
    }

    if (clean.length > 1) {
      const chars = clean.slice(0, 6).split('')
      const next = [...digits]
      chars.forEach((ch, i) => {
        if (index + i < 6) next[index + i] = ch
      })
      setDigits(next)
      const focusAt = Math.min(index + chars.length, 5)
      inputsRef.current[focusAt]?.focus()
      if (next.every((d) => d) && next.join('').length === 6) {
        void verifyOtp(next.join(''))
      }
      return
    }

    const next = [...digits]
    next[index] = clean
    setDigits(next)
    if (index < 5) inputsRef.current[index + 1]?.focus()
    if (next.every((d) => d)) void verifyOtp(next.join(''))
  }

  function onDigitKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  function backToEmail() {
    setStep('email')
    setDigits(['', '', '', '', '', ''])
    setError('')
  }

  return (
    <div className="otp-login">
      <div className="otp-login-shell">
        <aside className="otp-login-brand" aria-hidden={false}>
          <div className="otp-login-brand-inner">
            <span className="otp-login-mark">CV</span>
            <p className="otp-login-kicker">Secure admin access</p>
            <h1>Sign in with a one-time code</h1>
            <p className="otp-login-brand-copy">
              We email a 6-digit code to your authorized admin address. No password to remember.
            </p>
            <ul className="otp-login-points">
              <li>Expires in 10 minutes</li>
              <li>Works only for your admin email</li>
              <li>Session stays signed in for 7 days</li>
            </ul>
          </div>
        </aside>

        <section className="otp-login-panel">
          <div className="otp-login-panel-inner">
            <div className="otp-steps" aria-label="Login steps">
              <div className={`otp-step${step === 'email' ? ' active' : step === 'otp' ? ' done' : ''}`}>
                <span>1</span>
                Email
              </div>
              <div className="otp-step-line" aria-hidden />
              <div className={`otp-step${step === 'otp' ? ' active' : ''}`}>
                <span>2</span>
                OTP
              </div>
            </div>

            {step === 'email' ? (
              <>
                <header className="otp-login-header">
                  <h2>Welcome back</h2>
                  <p>Enter your admin email to receive a verification code.</p>
                </header>

                {error && <div className="otp-alert error">{error}</div>}

                <form className="otp-login-form" onSubmit={sendOtp}>
                  <label className="otp-field">
                    <span>Email address</span>
                    <input
                      type="email"
                      value={mail}
                      onChange={(e) => setMail(e.target.value)}
                      required
                      autoComplete="username"
                      placeholder="you@company.com"
                      autoFocus
                    />
                  </label>
                  <button className="otp-submit" type="submit" disabled={busy || !mail.trim()}>
                    {busy ? 'Sending code…' : 'Continue'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <header className="otp-login-header">
                  <h2>Check your inbox</h2>
                  <p>
                    Code sent to <strong>{mail}</strong>
                  </p>
                </header>

                {error && <div className="otp-alert error">{error}</div>}

                <form
                  className="otp-login-form"
                  onSubmit={(e) => {
                    e.preventDefault()
                    void verifyOtp()
                  }}
                >
                  <div className="otp-field">
                    <span>6-digit code</span>
                    <div className="otp-boxes" role="group" aria-label="One-time password">
                      {digits.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => {
                            inputsRef.current[index] = el
                          }}
                          className={`otp-box${digit ? ' filled' : ''}`}
                          inputMode="numeric"
                          autoComplete={index === 0 ? 'one-time-code' : 'off'}
                          maxLength={6}
                          value={digit}
                          onChange={(e) => onDigitChange(index, e.target.value)}
                          onKeyDown={(e) => onDigitKeyDown(index, e)}
                          onFocus={(e) => e.target.select()}
                          aria-label={`Digit ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    className="otp-submit"
                    type="submit"
                    disabled={busy || digits.join('').length !== 6}
                  >
                    {busy ? 'Verifying…' : 'Verify and enter admin'}
                  </button>

                  <div className="otp-footer-actions">
                    <button
                      type="button"
                      className="otp-text-btn"
                      disabled={busy || cooldown > 0}
                      onClick={() => void sendOtp()}
                    >
                      {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
                    </button>
                    <button type="button" className="otp-text-btn" disabled={busy} onClick={backToEmail}>
                      Use a different email
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
