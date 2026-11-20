'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { api, type Blog } from '@/api/client'
import { Pagination } from '@/components/Pagination'
import { COVER_PRESETS } from './coverPresets'
import type { Editor } from '@tiptap/react'
import { downloadWordDoc, EditorFormatBar, NotionEditor } from './NotionEditor'

const SIDEBAR_PAGE_SIZE = 8

type Draft = {
  title: string
  summary: string
  content: string
  venue: string
  date: string
  tags: string
  featured: boolean
  visibility: 'public' | 'private'
  imageUrl: string
}

const emptyDraft = (): Draft => ({
  title: '',
  summary: '',
  content: '',
  venue: '',
  date: new Date().toISOString().slice(0, 7),
  tags: '',
  featured: true,
  visibility: 'private',
  imageUrl: '',
})

function toDraft(blog: Blog): Draft {
  return {
    title: blog.title,
    summary: blog.summary || '',
    content: blog.content || '',
    venue: blog.venue || '',
    date: blog.date || '',
    tags: (blog.tags || []).join(', '),
    featured: blog.featured,
    visibility: blog.visibility,
    imageUrl: blog.imageUrl || '',
  }
}

export function AdminBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [selectedId, setSelectedId] = useState<string | 'new' | null>(null)
  const [draft, setDraft] = useState<Draft>(emptyDraft())
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [query, setQuery] = useState('')
  const [shareOpen, setShareOpen] = useState(false)
  const [propsOpen, setPropsOpen] = useState(false)
  const [coverOpen, setCoverOpen] = useState(false)
  const [coverDragging, setCoverDragging] = useState(false)
  const [toast, setToast] = useState('')
  const [listPage, setListPage] = useState(1)
  const [editor, setEditor] = useState<Editor | null>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const onEditorReady = useCallback((ed: Editor | null) => setEditor(ed), [])
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const draftRef = useRef(draft)
  draftRef.current = draft
  const selectedRef = useRef(selectedId)
  selectedRef.current = selectedId

  const showToast = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(''), 2200)
  }

  const load = useCallback(async () => {
    const list = await api.getBlogs()
    setBlogs(list)
    return list
  }, [])

  useEffect(() => {
    void load().then((list) => {
      if (list[0]) {
        setSelectedId(list[0]._id)
        setDraft(toDraft(list[0]))
      } else {
        setSelectedId('new')
        setDraft(emptyDraft())
      }
    })
  }, [load])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return blogs
    return blogs.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        (b.summary || '').toLowerCase().includes(q) ||
        (b.tags || []).some((t) => t.toLowerCase().includes(q)),
    )
  }, [blogs, query])

  const listTotalPages = Math.max(1, Math.ceil(filtered.length / SIDEBAR_PAGE_SIZE))
  const pagedBlogs = useMemo(() => {
    const start = (listPage - 1) * SIDEBAR_PAGE_SIZE
    return filtered.slice(start, start + SIDEBAR_PAGE_SIZE)
  }, [filtered, listPage])

  useEffect(() => {
    setListPage(1)
  }, [query])

  useEffect(() => {
    if (listPage > listTotalPages) setListPage(listTotalPages)
  }, [listPage, listTotalPages])

  function openNew() {
    setSelectedId('new')
    setDraft(emptyDraft())
    setError('')
    setStatus('')
  }

  function openBlog(blog: Blog) {
    setSelectedId(blog._id)
    setDraft(toDraft(blog))
    setError('')
    setStatus('')
  }

  function patchDraft(partial: Partial<Draft>) {
    setDraft((d) => {
      const merged = { ...d, ...partial }
      draftRef.current = merged
      return merged
    })
    setStatus('Editing…')
  }

  async function save(next?: Partial<Draft>) {
    const current = { ...draftRef.current, ...next }
    const currentId = selectedRef.current
    if (!current.title.trim()) {
      setError('Add a title to save this page')
      showToast('Title required')
      return
    }
    setBusy(true)
    setError('')
    setStatus('Saving…')
    const payload = {
      title: current.title.trim() || 'Untitled',
      summary: current.summary,
      content: current.content,
      venue: current.venue,
      date: current.date,
      tags: current.tags,
      featured: current.featured,
      visibility: current.visibility,
      imageUrl: current.imageUrl,
      links: [],
    }
    try {
      if (currentId && currentId !== 'new') {
        const updated = await api.updateBlog(currentId, payload)
        setDraft(toDraft(updated))
        draftRef.current = toDraft(updated)
        setStatus('Saved')
        showToast('Page saved')
      } else {
        const created = await api.createBlog(payload)
        setSelectedId(created._id)
        selectedRef.current = created._id
        setDraft(toDraft(created))
        draftRef.current = toDraft(created)
        setStatus('Created')
        showToast('Page created')
      }
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
      setStatus('')
      showToast('Save failed')
    } finally {
      setBusy(false)
    }
  }

  function scheduleSave(partial?: Partial<Draft>) {
    if (partial) {
      setDraft((d) => {
        const merged = { ...d, ...partial }
        draftRef.current = merged
        return merged
      })
    }
    setStatus('Editing…')
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      void save()
    }, 1000)
  }

  async function toggleVisibility() {
    const next = draft.visibility === 'public' ? 'private' : 'public'
    patchDraft({ visibility: next })
    if (selectedId && selectedId !== 'new') {
      setBusy(true)
      try {
        const updated = await api.setBlogVisibility(selectedId, next)
        setDraft(toDraft(updated))
        draftRef.current = toDraft(updated)
        setStatus(next === 'public' ? 'Published' : 'Private')
        showToast(next === 'public' ? 'Published to Articles' : 'Moved to private')
        await load()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Visibility update failed')
      } finally {
        setBusy(false)
      }
    }
  }

  async function remove() {
    if (!selectedId || selectedId === 'new') {
      openNew()
      setShareOpen(false)
      return
    }
    if (!confirm('Delete this page permanently?')) return
    await api.deleteBlog(selectedId)
    showToast('Page deleted')
    setShareOpen(false)
    const list = await load()
    if (list[0]) openBlog(list[0])
    else openNew()
  }

  async function onCover(file: File | null) {
    if (!file) return
    setBusy(true)
    try {
      const res = await api.upload(file)
      const next = { imageUrl: res.url }
      patchDraft(next)
      await save(next)
      setCoverOpen(false)
      showToast('Cover updated')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="notion-workspace">
      <aside className="notion-sidebar">
        <div className="notion-sidebar-top">
          <span className="notion-workspace-label">Private & shared</span>
          <button type="button" className="notion-new-btn" onClick={openNew} title="New page">
            +
          </button>
        </div>
        <input
          className="notion-search"
          placeholder="Search pages…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <p className="notion-section-label">Pages ({filtered.length})</p>
        <div className="notion-page-list">
          <button
            type="button"
            className={`notion-page-item${selectedId === 'new' ? ' active' : ''}`}
            onClick={openNew}
          >
            <span className="notion-page-icon">✨</span>
            <span>New page</span>
          </button>
          {pagedBlogs.map((blog) => (
            <button
              key={blog._id}
              type="button"
              className={`notion-page-item${selectedId === blog._id ? ' active' : ''}`}
              onClick={() => openBlog(blog)}
            >
              <span className="notion-page-icon">{blog.visibility === 'public' ? '🌐' : '🔒'}</span>
              <span className="notion-page-title">{blog.title || 'Untitled'}</span>
              <span className={`notion-page-badge ${blog.visibility}`}>{blog.visibility}</span>
            </button>
          ))}
          {filtered.length === 0 && <p className="notion-empty-list">No pages yet</p>}
        </div>
        <div className="notion-sidebar-pager">
          <Pagination
            page={listPage}
            totalPages={listTotalPages}
            onChange={setListPage}
            label="Blog pages"
            compact
          />
        </div>
      </aside>

      <section className="notion-editor">
        <header className="notion-topbar">
          <div className="notion-topbar-left">
            <span className="notion-crumb">Blog / {draft.title || 'Untitled'}</span>
            {status && <span className="notion-status">{status}</span>}
            <EditorFormatBar editor={editor} />
          </div>
          <div className="notion-topbar-right">
            <button
              type="button"
              className={`topbar-visibility ${draft.visibility}`}
              onClick={() => void toggleVisibility()}
              disabled={busy}
              title="Toggle public / private — Public pages show under Articles"
            >
              <span className="topbar-visibility-dot" />
              <span className="topbar-visibility-text">
                {draft.visibility === 'public' ? 'Public' : 'Private'}
              </span>
              <span className="notion-toggle-track" aria-hidden>
                <span className="notion-toggle-thumb" />
              </span>
            </button>
            <button type="button" className="notion-save-btn" onClick={() => setCoverOpen(true)}>
              {draft.imageUrl ? 'Change cover' : 'Add cover'}
            </button>
            <button type="button" className="notion-save-btn" onClick={() => setPropsOpen(true)}>
              Properties
            </button>
            <button type="button" className="notion-save-btn" onClick={() => setShareOpen(true)}>
              Share
            </button>
            <button
              type="button"
              className="notion-save-btn primary"
              disabled={busy}
              onClick={() => void save()}
            >
              {busy ? 'Saving…' : 'Save'}
            </button>
          </div>
        </header>

        {error && <div className="admin-error notion-error">{error}</div>}

        <div className="notion-page-canvas">
          <div className="notion-doc">
            {draft.imageUrl ? (
              <div className="notion-cover has-image" style={{ backgroundImage: `url(${draft.imageUrl})` }} />
            ) : null}
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => void onCover(e.target.files?.[0] || null)}
            />

            <div className="notion-doc-body">
              <textarea
                className="notion-title-input"
                rows={1}
                placeholder="Untitled"
                value={draft.title}
                onChange={(e) => {
                  patchDraft({ title: e.target.value })
                  e.target.style.height = 'auto'
                  e.target.style.height = `${e.target.scrollHeight}px`
                }}
                onBlur={() => void save()}
              />

              <textarea
                className="notion-summary-input"
                placeholder="Add a short description…"
                value={draft.summary}
                rows={2}
                onChange={(e) => scheduleSave({ summary: e.target.value })}
              />

              <div className="notion-divider" />

              <NotionEditor
                key={selectedId || 'new'}
                content={draft.content}
                onChange={(html) => scheduleSave({ content: html })}
                onEditorReady={onEditorReady}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Share popup */}
      {shareOpen && (
        <div className="notion-modal-backdrop" onClick={() => setShareOpen(false)}>
          <div className="notion-modal share-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Share & publish</h3>
            <p className="notion-modal-help">
              Public pages appear under Articles on your site. Private pages stay in admin only.
            </p>

            <div className="share-row">
              <div>
                <strong>{draft.visibility === 'public' ? 'Public access' : 'Private page'}</strong>
                <span>
                  {draft.visibility === 'public'
                    ? 'Anyone can view this as an Article'
                    : 'Only you can see this draft'}
                </span>
              </div>
              <button
                type="button"
                className={`notion-visibility-toggle ${draft.visibility}`}
                onClick={() => void toggleVisibility()}
              >
                <span className="notion-toggle-track">
                  <span className="notion-toggle-thumb" />
                </span>
                <span className="notion-toggle-label">
                  {draft.visibility === 'public' ? 'Public' : 'Private'}
                </span>
              </button>
            </div>

            <div className="share-actions">
              <button
                type="button"
                onClick={() => {
                  downloadWordDoc(draft.title || 'Untitled', draft.summary, draft.content)
                  showToast('Word file downloaded')
                }}
              >
                ↓ Download Word
              </button>
              <button type="button" className="danger" onClick={() => void remove()}>
                Delete page
              </button>
            </div>

            <div className="notion-modal-actions">
              <button type="button" className="ghost" onClick={() => setShareOpen(false)}>
                Close
              </button>
              <button
                type="button"
                className="primary"
                onClick={() => {
                  void save()
                  setShareOpen(false)
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cover gallery popup */}
      {coverOpen && (
        <div className="notion-modal-backdrop" onClick={() => setCoverOpen(false)}>
          <div className="notion-modal cover-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add cover</h3>
            <p className="notion-modal-help">
              Pick a gallery cover, upload your own, or drag an image here.
            </p>

            <div
              className={`cover-dropzone${coverDragging ? ' dragging' : ''}`}
              onDragOver={(e) => {
                e.preventDefault()
                setCoverDragging(true)
              }}
              onDragLeave={() => setCoverDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setCoverDragging(false)
                const file = e.dataTransfer.files?.[0]
                if (file) void onCover(file)
              }}
              onClick={() => coverInputRef.current?.click()}
            >
              <strong>Drop image here</strong>
              <span>or click to upload from your device</span>
            </div>

            <p className="notion-section-label" style={{ margin: '0.25rem 0' }}>
              Gallery
            </p>
            <div className="cover-gallery">
              {COVER_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className={`cover-gallery-item${draft.imageUrl === preset.url ? ' selected' : ''}`}
                  style={{ backgroundImage: `url(${preset.url})` }}
                  title={preset.label}
                  onClick={() => {
                    patchDraft({ imageUrl: preset.url })
                    void save({ imageUrl: preset.url })
                    setCoverOpen(false)
                    showToast(`${preset.label} cover applied`)
                  }}
                >
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>

            {draft.imageUrl && (
              <div
                className="notion-cover-preview"
                style={{ backgroundImage: `url(${draft.imageUrl})` }}
              />
            )}

            <div className="share-actions">
              <button type="button" className="primary" onClick={() => coverInputRef.current?.click()}>
                Upload custom image
              </button>
              {draft.imageUrl && (
                <button
                  type="button"
                  className="danger"
                  onClick={() => {
                    patchDraft({ imageUrl: '' })
                    void save({ imageUrl: '' })
                    showToast('Cover removed')
                  }}
                >
                  Remove cover
                </button>
              )}
            </div>

            <div className="notion-modal-actions">
              <button type="button" className="ghost" onClick={() => setCoverOpen(false)}>
                Close
              </button>
              <button type="button" className="primary" onClick={() => setCoverOpen(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Properties popup */}
      {propsOpen && (
        <div className="notion-modal-backdrop" onClick={() => setPropsOpen(false)}>
          <div className="notion-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Page properties</h3>
            <label>
              Featured
              <select
                value={draft.featured ? 'yes' : 'no'}
                onChange={(e) => patchDraft({ featured: e.target.value === 'yes' })}
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </label>
            <label>
              Date
              <input value={draft.date} onChange={(e) => patchDraft({ date: e.target.value })} />
            </label>
            <label>
              Venue
              <input value={draft.venue} onChange={(e) => patchDraft({ venue: e.target.value })} />
            </label>
            <label>
              Tags
              <input
                value={draft.tags}
                placeholder="Kubernetes, CI/CD"
                onChange={(e) => patchDraft({ tags: e.target.value })}
              />
            </label>
            <div className="notion-modal-actions">
              <button type="button" className="ghost" onClick={() => setPropsOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="primary"
                onClick={() => {
                  void save()
                  setPropsOpen(false)
                  showToast('Properties saved')
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="notion-toast">{toast}</div>}
    </div>
  )
}
