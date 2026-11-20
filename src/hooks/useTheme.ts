'use client'

import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

export function useTheme() {
  // Default theme is dark (matches SSR html attribute)
  const [theme, setTheme] = useState<Theme>('dark')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null
    const preferred = stored === 'light' || stored === 'dark' ? stored : 'dark'
    setTheme(preferred)
    document.documentElement.setAttribute('data-theme', preferred)
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme, ready])

  const toggle = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))

  return { theme, toggle, ready }
}
