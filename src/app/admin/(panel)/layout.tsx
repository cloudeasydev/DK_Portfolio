'use client'

import { RequireAdmin } from '@/admin/AdminAuth'
import { AdminShell } from '@/admin/AdminLayout'

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAdmin>
      <AdminShell>{children}</AdminShell>
    </RequireAdmin>
  )
}
