'use client'

import { useRouter } from 'next/navigation'
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api } from '@/api/client'

type AuthCtx = {
  email: string | null
  ready: boolean
  loginWithOtp: (email: string, code: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthCtx | null>(null)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      setReady(true)
      return
    }
    api
      .me()
      .then((u) => setEmail(u.email))
      .catch(() => localStorage.removeItem('admin_token'))
      .finally(() => setReady(true))
  }, [])

  const value = useMemo<AuthCtx>(
    () => ({
      email,
      ready,
      loginWithOtp: async (mail, code) => {
        const res = await api.verifyOtp(mail, code)
        localStorage.setItem('admin_token', res.token)
        setEmail(res.email)
      },
      logout: () => {
        localStorage.removeItem('admin_token')
        setEmail(null)
      },
    }),
    [email, ready],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAdminAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAdminAuth requires AdminAuthProvider')
  return ctx
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { email, ready } = useAdminAuth()
  const router = useRouter()

  useEffect(() => {
    if (ready && !email) router.replace('/admin/login')
  }, [ready, email, router])

  if (!ready) return <div className="admin-loading">Loading…</div>
  if (!email) return <div className="admin-loading">Redirecting…</div>
  return children
}
