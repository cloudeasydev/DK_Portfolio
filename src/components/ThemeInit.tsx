'use client'

import { useEffect } from 'react'

/** Applies stored theme ASAP after mount (no SSR mismatch). */
export function ThemeInit() {
  useEffect(() => {
    try {
      const stored = localStorage.getItem('theme')
      const theme = stored === 'light' || stored === 'dark' ? stored : 'dark'
      document.documentElement.setAttribute('data-theme', theme)
    } catch {
      /* ignore */
    }
  }, [])
  return null
}
