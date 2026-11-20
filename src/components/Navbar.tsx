'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { navLinks } from '@/data/content'
import { useContent } from '@/context/ContentContext'
import { useTheme } from '@/hooks/useTheme'
import { IconClose, IconMenu, IconMoon, IconSun } from './Icons'

export function Navbar() {
  const { profile } = useContent()
  const { theme, toggle, ready } = useTheme()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const goTo = (path: string) => {
    setOpen(false)
    if (!path.includes('#')) return

    const id = path.split('#')[1]
    if (pathname === '/') {
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      })
      return
    }
    router.push(path)
  }

  return (
    <header className={`navbar${scrolled ? ' is-scrolled' : ''}`}>
      <div className="navbar-inner">
        <Link href="/" className="brand" onClick={() => setOpen(false)}>
          {profile.name}
        </Link>

        <nav className={`nav-links${open ? ' open' : ''}`} aria-label="Main">
          {navLinks.map((link) => {
            const isHash = link.path.includes('#')
            const isActive =
              (!isHash && pathname === link.path) ||
              (link.path === '/#about' && pathname === '/')
            return (
              <Link
                key={link.name}
                href={link.path}
                className={`nav-link${isActive ? ' active' : ''}`}
                onClick={(e) => {
                  if (isHash) {
                    e.preventDefault()
                    goTo(link.path)
                  } else {
                    setOpen(false)
                  }
                }}
              >
                {link.name}
              </Link>
            )
          })}
        </nav>

        <div className="nav-actions">
          <button
            type="button"
            className="icon-btn"
            onClick={toggle}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            suppressHydrationWarning
          >
            {!ready ? (
              <span className="theme-placeholder" aria-hidden />
            ) : theme === 'light' ? (
              <IconMoon />
            ) : (
              <IconSun />
            )}
          </button>
          <button
            type="button"
            className="icon-btn menu-btn"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </div>
    </header>
  )
}
