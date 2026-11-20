'use client'

import { AdminAuthProvider } from '@/admin/AdminAuth'

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>
}
