'use client'

import { ContentProvider } from '@/context/ContentContext'
import { Footer } from './Footer'
import { Navbar } from './Navbar'
import { ThemeInit } from './ThemeInit'

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <ContentProvider>
      <ThemeInit />
      <div className="app-shell">
        <Navbar />
        <div className="page-content">{children}</div>
        <Footer />
      </div>
    </ContentProvider>
  )
}
