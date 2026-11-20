'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAdminAuth } from './AdminAuth'

const links = [
  { to: '/admin', end: true, label: 'Dashboard', icon: '▦' },
  { to: '/admin/profile', label: 'Profile', icon: '👤' },
  { to: '/admin/blogs', label: 'Blog', icon: '✎' },
  { to: '/admin/projects', label: 'Projects', icon: '◇' },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { email, logout } = useAdminAuth()
  const pathname = usePathname()

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-brand-mark">CV</span>
          <div>
            <strong>Admin</strong>
            <small>Content studio</small>
          </div>
        </div>
        <nav>
          {links.map((l) => {
            const active = l.end ? pathname === l.to : pathname.startsWith(l.to)
            return (
              <Link key={l.to} href={l.to} className={active ? 'active' : ''}>
                <span className="admin-nav-icon">{l.icon}</span>
                {l.label}
              </Link>
            )
          })}
        </nav>
        <div className="admin-sidebar-foot">
          <span className="admin-email">{email}</span>
          <button type="button" onClick={logout}>
            Logout
          </button>
          <a href="/" target="_blank" rel="noreferrer">
            View site ↗
          </a>
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  )
}
