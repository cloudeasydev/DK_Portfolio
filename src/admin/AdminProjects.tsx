'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { api, type Project } from '@/api/client'
import { Pagination } from '@/components/Pagination'

const PAGE_SIZE = 6

const empty = {
  title: '',
  summary: '',
  tags: '',
  url: '',
  date: '',
  featured: true,
  imageUrl: '',
}

export function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [page, setPage] = useState(1)

  async function load() {
    setProjects(await api.getProjects())
  }

  useEffect(() => {
    void load()
  }, [])

  function startEdit(p: Project) {
    setEditingId(p._id)
    setForm({
      title: p.title,
      summary: p.summary,
      tags: (p.tags || []).join(', '),
      url: p.url,
      date: p.date,
      featured: p.featured,
      imageUrl: p.imageUrl || '',
    })
  }

  function reset() {
    setEditingId(null)
    setForm(empty)
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const payload = {
        title: form.title,
        summary: form.summary,
        tags: form.tags,
        url: form.url,
        date: form.date,
        featured: form.featured,
        imageUrl: form.imageUrl,
      }
      if (editingId) await api.updateProject(editingId, payload)
      else await api.createProject(payload)
      reset()
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete project?')) return
    await api.deleteProject(id)
    await load()
  }

  async function onUpload(file: File | null) {
    if (!file) return
    const res = await api.upload(file)
    setForm((f) => ({ ...f, imageUrl: res.url }))
  }

  const totalPages = Math.max(1, Math.ceil(projects.length / PAGE_SIZE))
  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return projects.slice(start, start + PAGE_SIZE)
  }, [projects, page])

  return (
    <div className="admin-page">
      <h1>Projects</h1>
      <form className="admin-form" onSubmit={onSubmit}>
        <h2>{editingId ? 'Edit project' : 'New project'}</h2>
        {error && <div className="admin-error">{error}</div>}
        <div className="admin-grid-2">
          <label>
            Title
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </label>
          <label>
            URL
            <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
          </label>
          <label>
            Date
            <input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </label>
          <label>
            Tags
            <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          </label>
        </div>
        <label>
          Summary
          <textarea
            rows={3}
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
          />
        </label>
        <label className="admin-check">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setForm({ ...form, featured: e.target.checked })}
          />
          Featured
        </label>
        <label>
          Image
          <input type="file" accept="image/*" onChange={(e) => void onUpload(e.target.files?.[0] || null)} />
        </label>
        <div className="admin-actions-row">
          <button className="admin-btn" type="submit" disabled={busy}>
            {busy ? 'Saving…' : editingId ? 'Update' : 'Create'}
          </button>
          {editingId && (
            <button type="button" className="admin-btn secondary" onClick={reset}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Date</th>
              <th>Featured</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((p) => (
              <tr key={p._id}>
                <td>{p.title}</td>
                <td>{p.date}</td>
                <td>{p.featured ? 'Yes' : 'No'}</td>
                <td className="admin-row-actions">
                  <button type="button" onClick={() => startEdit(p)}>
                    Edit
                  </button>
                  <button type="button" className="danger" onClick={() => void remove(p._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={Math.min(page, totalPages)} totalPages={totalPages} onChange={setPage} label="Projects" />
    </div>
  )
}
