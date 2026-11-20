'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { api, type Blog, type Profile, type Project } from '../api/client'
import { articles as fallbackArticles, projects as fallbackProjects } from '../data/content'
import { profile as fallbackProfile } from '../data/profile'

type ContentState = {
  profile: Profile
  articles: Blog[]
  projects: Project[]
  loading: boolean
  refresh: () => Promise<void>
}

const ContentContext = createContext<ContentState | null>(null)

function mapFallbackArticles(): Blog[] {
  return fallbackArticles
    .filter((a) => a.featured !== false)
    .map((a, i) => ({
      _id: a.id || String(i),
      title: a.title,
      summary: a.summary,
      venue: a.venue,
      date: a.date,
      tags: a.tags,
      featured: Boolean(a.featured),
      visibility: 'public' as const,
      links: a.links,
    }))
}

function mapFallbackProjects(): Project[] {
  return fallbackProjects.map((p, i) => ({
    _id: p.id || String(i),
    title: p.title,
    summary: p.summary,
    tags: p.tags,
    url: p.url,
    featured: Boolean(p.featured),
    date: p.date,
  }))
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(fallbackProfile as Profile)
  const [articles, setArticles] = useState<Blog[]>(mapFallbackArticles())
  const [projects, setProjects] = useState<Project[]>(mapFallbackProjects())
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [p, blogs, projs] = await Promise.all([
        api.getProfile(),
        api.getPublicBlogs(),
        api.getProjects(),
      ])
      if (p && p.name) setProfile(p)
      setArticles(blogs)
      setProjects(projs)
    } catch {
      // keep fallbacks when API is offline
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const value = useMemo(
    () => ({ profile, articles, projects, loading, refresh }),
    [profile, articles, projects, loading, refresh],
  )

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}

export function useContent() {
  const ctx = useContext(ContentContext)
  if (!ctx) throw new Error('useContent must be used within ContentProvider')
  return ctx
}
