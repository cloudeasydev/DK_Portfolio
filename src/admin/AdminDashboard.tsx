'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { api, type Blog, type Project } from '@/api/client'

export function AdminDashboard() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    void Promise.all([api.getBlogs(), api.getProjects()]).then(([b, p]) => {
      setBlogs(b)
      setProjects(p)
    })
  }, [])

  const publicCount = blogs.filter((b) => b.visibility === 'public').length
  const privateCount = blogs.length - publicCount

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <p className="admin-eyebrow">Overview</p>
          <h1>Dashboard</h1>
          <p className="admin-lead">Edit profile, publish articles, and manage projects.</p>
        </div>
        <Link className="admin-btn" href="/admin/blogs">
          Open Blog Editor
        </Link>
      </div>

      <div className="admin-stats">
        <div className="admin-stat">
          <strong>{blogs.length}</strong>
          <span>Blog posts</span>
        </div>
        <div className="admin-stat accent">
          <strong>{publicCount}</strong>
          <span>Public articles</span>
        </div>
        <div className="admin-stat">
          <strong>{privateCount}</strong>
          <span>Private drafts</span>
        </div>
        <div className="admin-stat">
          <strong>{projects.length}</strong>
          <span>Projects</span>
        </div>
      </div>

      <div className="admin-quick-grid">
        <Link href="/admin/blogs" className="admin-quick-card">
          <h3>Notion Blog</h3>
          <p>Rich text, images, public/private toggle, Word download.</p>
        </Link>
        <Link href="/admin/profile" className="admin-quick-card">
          <h3>Profile</h3>
          <p>Update bio, skills, certifications, and experience.</p>
        </Link>
        <Link href="/admin/projects" className="admin-quick-card">
          <h3>Projects</h3>
          <p>Add portfolio projects with tags and images.</p>
        </Link>
      </div>
    </div>
  )
}
