const API = '/api'

export type Blog = {
  _id: string
  title: string
  summary: string
  content?: string
  venue: string
  date: string
  tags: string[]
  featured: boolean
  visibility: 'public' | 'private'
  links: { label: string; url: string }[]
  imageUrl?: string
}

export type Project = {
  _id: string
  title: string
  summary: string
  tags: string[]
  url: string
  featured: boolean
  date: string
  imageUrl?: string
}

export type Profile = {
  _id?: string
  name: string
  given?: string
  family?: string
  pronouns?: string
  role: string
  organization?: string
  organizationUrl?: string
  avatar?: string
  resumeUrl?: string
  email?: string
  bio?: string
  about?: string
  links?: { label: string; url: string; icon: string }[]
  interests?: string[]
  education?: {
    degree: string
    institution: string
    start: string
    end: string
    summary?: string
  }[]
  experience?: {
    role: string
    org: string
    start: string
    end: string
    summary?: string
  }[]
  skills?: { name: string; items: { label: string; level?: number }[] }[]
  languages?: { name: string; level: number; label: string }[]
  awards?: { title: string; awarder: string; date: string; summary?: string }[]
  certifications?: { name: string; issuer: string; year: string }[]
}

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('admin_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(options.headers || {}),
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`)
  }
  return data as T
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; email: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  requestOtp: (email: string) =>
    request<{ ok: boolean; email: string; message: string; expiresInSec: number }>(
      '/auth/otp/request',
      {
        method: 'POST',
        body: JSON.stringify({ email }),
      },
    ),
  verifyOtp: (email: string, code: string) =>
    request<{ token: string; email: string }>('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    }),
  me: () => request<{ email: string }>('/auth/me'),
  getProfile: () => request<Profile>('/profile'),
  updateProfile: (body: Partial<Profile>) =>
    request<Profile>('/profile', { method: 'PUT', body: JSON.stringify(body) }),
  getPublicBlogs: () => request<Blog[]>('/blogs/public'),
  getBlogs: () => request<Blog[]>('/blogs'),
  createBlog: (body: Record<string, unknown>) =>
    request<Blog>('/blogs', { method: 'POST', body: JSON.stringify(body) }),
  updateBlog: (id: string, body: Record<string, unknown>) =>
    request<Blog>(`/blogs/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  setBlogVisibility: (id: string, visibility: 'public' | 'private') =>
    request<Blog>(`/blogs/${id}/visibility`, {
      method: 'PATCH',
      body: JSON.stringify({ visibility }),
    }),
  deleteBlog: (id: string) => request<{ ok: boolean }>(`/blogs/${id}`, { method: 'DELETE' }),
  getProjects: () => request<Project[]>('/projects'),
  createProject: (body: Record<string, unknown>) =>
    request<Project>('/projects', { method: 'POST', body: JSON.stringify(body) }),
  updateProject: (id: string, body: Record<string, unknown>) =>
    request<Project>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteProject: (id: string) =>
    request<{ ok: boolean }>(`/projects/${id}`, { method: 'DELETE' }),
  upload: async (file: File) => {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`${API}/media`, {
      method: 'POST',
      headers: authHeaders(),
      body: form,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Upload failed')
    return data as { id: string; url: string }
  },
}
