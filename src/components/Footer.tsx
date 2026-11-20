'use client'

import { useContent } from '../context/ContentContext'

export function Footer() {
  const { profile } = useContent()
  const year = new Date().getFullYear()
  return (
    <footer className="site-footer">
      <div className="container">
        <p>
          © {year} {profile.name}. Built with React + Vite.
        </p>
      </div>
    </footer>
  )
}
