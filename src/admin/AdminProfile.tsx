'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { api, type Profile } from '../api/client'

type ExperienceItem = NonNullable<Profile['experience']>[number]
type EducationItem = NonNullable<Profile['education']>[number]
type CertItem = NonNullable<Profile['certifications']>[number]
type SkillGroup = NonNullable<Profile['skills']>[number]
type SocialLink = NonNullable<Profile['links']>[number]

const SOCIAL_ICONS = [
  { value: 'email', label: 'Email' },
  { value: 'github', label: 'GitHub' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'x', label: 'X / Twitter' },
] as const

const emptyExperience = (): ExperienceItem => ({
  role: '',
  org: '',
  start: '',
  end: '',
  summary: '',
})

const emptyEducation = (): EducationItem => ({
  degree: '',
  institution: '',
  start: '',
  end: '',
  summary: '',
})

const emptyCert = (): CertItem => ({ name: '', issuer: '', year: '' })

const emptySkill = (): SkillGroup => ({ name: '', items: [{ label: '', level: 5 }] })

const emptyLink = (): SocialLink => ({ label: '', url: '', icon: 'github' })

export function AdminProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [interestsText, setInterestsText] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    void api.getProfile().then((p) => {
      setProfile({
        ...p,
        links: p.links?.length ? p.links : [emptyLink()],
        experience: p.experience?.length ? p.experience : [emptyExperience()],
        education: p.education?.length ? p.education : [emptyEducation()],
        certifications: p.certifications?.length ? p.certifications : [emptyCert()],
        skills: p.skills?.length ? p.skills : [emptySkill()],
      })
      setInterestsText((p.interests || []).join('\n'))
    })
  }, [])

  async function onUploadAvatar(file: File | null) {
    if (!file || !profile) return
    const res = await api.upload(file)
    setProfile({ ...profile, avatar: res.url })
  }

  async function onUploadResume(file: File | null) {
    if (!file || !profile) return
    const res = await api.upload(file)
    setProfile({ ...profile, resumeUrl: res.url })
    setMessage('Resume attached — click Save profile to keep it')
  }

  function updateExperience(index: number, patch: Partial<ExperienceItem>) {
    if (!profile) return
    const experience = [...(profile.experience || [])]
    experience[index] = { ...experience[index], ...patch }
    setProfile({ ...profile, experience })
  }

  function updateEducation(index: number, patch: Partial<EducationItem>) {
    if (!profile) return
    const education = [...(profile.education || [])]
    education[index] = { ...education[index], ...patch }
    setProfile({ ...profile, education })
  }

  function updateCert(index: number, patch: Partial<CertItem>) {
    if (!profile) return
    const certifications = [...(profile.certifications || [])]
    certifications[index] = { ...certifications[index], ...patch }
    setProfile({ ...profile, certifications })
  }

  function updateLink(index: number, patch: Partial<SocialLink>) {
    if (!profile) return
    const links = [...(profile.links || [])]
    links[index] = { ...links[index], ...patch }
    setProfile({ ...profile, links })
  }

  function updateSkill(index: number, patch: Partial<SkillGroup> & { itemsText?: string }) {
    if (!profile) return
    const skills = [...(profile.skills || [])]
    const current = skills[index]
    const { itemsText, ...rest } = patch
    skills[index] = {
      ...current,
      ...rest,
      items:
        itemsText !== undefined
          ? itemsText
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
              .map((label) => ({ label, level: 5 }))
          : current.items,
    }
    setProfile({ ...profile, skills })
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!profile) return
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const interests = interestsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)

      const experience = (profile.experience || []).filter((item) => item.role.trim() || item.org.trim())
      const education = (profile.education || []).filter(
        (item) => item.degree.trim() || item.institution.trim(),
      )
      const certifications = (profile.certifications || []).filter((item) => item.name.trim())
      const links = (profile.links || []).filter((item) => item.label.trim() && item.url.trim())
      const skills = (profile.skills || [])
        .map((g) => ({
          name: g.name.trim(),
          items: (g.items || []).filter((i) => i.label.trim()),
        }))
        .filter((g) => g.name || g.items.length)

      const saved = await api.updateProfile({
        ...profile,
        interests,
        links,
        experience,
        education,
        certifications,
        skills,
      })
      setProfile({
        ...saved,
        links: saved.links?.length ? saved.links : [emptyLink()],
        experience: saved.experience?.length ? saved.experience : [emptyExperience()],
        education: saved.education?.length ? saved.education : [emptyEducation()],
        certifications: saved.certifications?.length ? saved.certifications : [emptyCert()],
        skills: saved.skills?.length ? saved.skills : [emptySkill()],
      })
      setMessage('Profile saved')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  if (!profile) return <div className="admin-loading">Loading profile…</div>

  return (
    <div className="admin-page">
      <h1>Profile</h1>
      <p className="admin-lead">Fill simple fields — no JSON needed.</p>
      <form className="admin-form" onSubmit={onSubmit}>
        {error && <div className="admin-error">{error}</div>}
        {message && <div className="admin-success">{message}</div>}

        <div className="admin-grid-2">
          <label>
            Name
            <input
              value={profile.name || ''}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
          </label>
          <label>
            Role
            <input
              value={profile.role || ''}
              onChange={(e) => setProfile({ ...profile, role: e.target.value })}
            />
          </label>
          <label>
            Organization
            <input
              value={profile.organization || ''}
              onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
            />
          </label>
          <label>
            Organization URL
            <input
              value={profile.organizationUrl || ''}
              onChange={(e) => setProfile({ ...profile, organizationUrl: e.target.value })}
            />
          </label>
          <label>
            Email
            <input
              value={profile.email || ''}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            />
          </label>
          <label>
            Pronouns
            <input
              value={profile.pronouns || ''}
              onChange={(e) => setProfile({ ...profile, pronouns: e.target.value })}
            />
          </label>
        </div>

        <label>
          Bio
          <textarea
            rows={4}
            value={profile.bio || ''}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          />
        </label>
        <label>
          About
          <textarea
            rows={4}
            value={profile.about || ''}
            onChange={(e) => setProfile({ ...profile, about: e.target.value })}
          />
        </label>
        <label>
          Interests (one per line)
          <textarea rows={4} value={interestsText} onChange={(e) => setInterestsText(e.target.value)} />
        </label>

        <section className="admin-repeat-section">
          <div className="admin-repeat-head">
            <h2>Social media links</h2>
            <button
              type="button"
              className="admin-btn secondary"
              onClick={() =>
                setProfile({
                  ...profile,
                  links: [...(profile.links || []), emptyLink()],
                })
              }
            >
              + Add link
            </button>
          </div>
          <p className="admin-lead" style={{ margin: 0 }}>
            These show as icons under your avatar on the home page.
          </p>
          {(profile.links || []).map((item, index) => (
            <div key={`link-${index}`} className="admin-repeat-card">
              <div className="admin-grid-2">
                <label>
                  Label
                  <input
                    value={item.label}
                    placeholder="GitHub"
                    onChange={(e) => updateLink(index, { label: e.target.value })}
                  />
                </label>
                <label>
                  Icon
                  <select
                    value={item.icon || 'github'}
                    onChange={(e) => updateLink(index, { icon: e.target.value })}
                  >
                    {SOCIAL_ICONS.map((icon) => (
                      <option key={icon.value} value={icon.value}>
                        {icon.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label style={{ gridColumn: '1 / -1' }}>
                  URL
                  <input
                    value={item.url}
                    placeholder="https://github.com/you or mailto:you@email.com"
                    onChange={(e) => updateLink(index, { url: e.target.value })}
                  />
                </label>
              </div>
              <button
                type="button"
                className="admin-btn secondary danger-text"
                onClick={() =>
                  setProfile({
                    ...profile,
                    links: (profile.links || []).filter((_, i) => i !== index),
                  })
                }
              >
                Remove
              </button>
            </div>
          ))}
        </section>

        <section className="admin-repeat-section">
          <div className="admin-repeat-head">
            <h2>Experience</h2>
            <button
              type="button"
              className="admin-btn secondary"
              onClick={() =>
                setProfile({
                  ...profile,
                  experience: [...(profile.experience || []), emptyExperience()],
                })
              }
            >
              + Add experience
            </button>
          </div>
          {(profile.experience || []).map((item, index) => (
            <div key={`exp-${index}`} className="admin-repeat-card">
              <div className="admin-grid-2">
                <label>
                  Job title / Role
                  <input
                    value={item.role}
                    placeholder="Senior DevOps Engineer"
                    onChange={(e) => updateExperience(index, { role: e.target.value })}
                  />
                </label>
                <label>
                  Company / Org
                  <input
                    value={item.org}
                    placeholder="Acme Cloud"
                    onChange={(e) => updateExperience(index, { org: e.target.value })}
                  />
                </label>
                <label>
                  Start
                  <input
                    value={item.start}
                    placeholder="2022"
                    onChange={(e) => updateExperience(index, { start: e.target.value })}
                  />
                </label>
                <label>
                  End
                  <input
                    value={item.end}
                    placeholder="Present"
                    onChange={(e) => updateExperience(index, { end: e.target.value })}
                  />
                </label>
              </div>
              <label>
                Summary
                <textarea
                  rows={3}
                  value={item.summary || ''}
                  placeholder="What you did in this role"
                  onChange={(e) => updateExperience(index, { summary: e.target.value })}
                />
              </label>
              <button
                type="button"
                className="admin-btn secondary danger-text"
                onClick={() =>
                  setProfile({
                    ...profile,
                    experience: (profile.experience || []).filter((_, i) => i !== index),
                  })
                }
              >
                Remove
              </button>
            </div>
          ))}
        </section>

        <section className="admin-repeat-section">
          <div className="admin-repeat-head">
            <h2>Education</h2>
            <button
              type="button"
              className="admin-btn secondary"
              onClick={() =>
                setProfile({
                  ...profile,
                  education: [...(profile.education || []), emptyEducation()],
                })
              }
            >
              + Add education
            </button>
          </div>
          {(profile.education || []).map((item, index) => (
            <div key={`edu-${index}`} className="admin-repeat-card">
              <div className="admin-grid-2">
                <label>
                  Degree
                  <input
                    value={item.degree}
                    placeholder="B.Tech Computer Science"
                    onChange={(e) => updateEducation(index, { degree: e.target.value })}
                  />
                </label>
                <label>
                  Institution
                  <input
                    value={item.institution}
                    placeholder="University name"
                    onChange={(e) => updateEducation(index, { institution: e.target.value })}
                  />
                </label>
                <label>
                  Start
                  <input
                    value={item.start}
                    placeholder="2016"
                    onChange={(e) => updateEducation(index, { start: e.target.value })}
                  />
                </label>
                <label>
                  End
                  <input
                    value={item.end}
                    placeholder="2020"
                    onChange={(e) => updateEducation(index, { end: e.target.value })}
                  />
                </label>
              </div>
              <label>
                Summary (optional)
                <textarea
                  rows={2}
                  value={item.summary || ''}
                  onChange={(e) => updateEducation(index, { summary: e.target.value })}
                />
              </label>
              <button
                type="button"
                className="admin-btn secondary danger-text"
                onClick={() =>
                  setProfile({
                    ...profile,
                    education: (profile.education || []).filter((_, i) => i !== index),
                  })
                }
              >
                Remove
              </button>
            </div>
          ))}
        </section>

        <section className="admin-repeat-section">
          <div className="admin-repeat-head">
            <h2>Certifications</h2>
            <button
              type="button"
              className="admin-btn secondary"
              onClick={() =>
                setProfile({
                  ...profile,
                  certifications: [...(profile.certifications || []), emptyCert()],
                })
              }
            >
              + Add certification
            </button>
          </div>
          {(profile.certifications || []).map((item, index) => (
            <div key={`cert-${index}`} className="admin-repeat-card">
              <div className="admin-grid-2">
                <label>
                  Name
                  <input
                    value={item.name}
                    placeholder="AWS Solutions Architect"
                    onChange={(e) => updateCert(index, { name: e.target.value })}
                  />
                </label>
                <label>
                  Issuer
                  <input
                    value={item.issuer}
                    placeholder="Amazon Web Services"
                    onChange={(e) => updateCert(index, { issuer: e.target.value })}
                  />
                </label>
                <label>
                  Year
                  <input
                    value={item.year}
                    placeholder="2024"
                    onChange={(e) => updateCert(index, { year: e.target.value })}
                  />
                </label>
              </div>
              <button
                type="button"
                className="admin-btn secondary danger-text"
                onClick={() =>
                  setProfile({
                    ...profile,
                    certifications: (profile.certifications || []).filter((_, i) => i !== index),
                  })
                }
              >
                Remove
              </button>
            </div>
          ))}
        </section>

        <section className="admin-repeat-section">
          <div className="admin-repeat-head">
            <h2>Skills</h2>
            <button
              type="button"
              className="admin-btn secondary"
              onClick={() =>
                setProfile({
                  ...profile,
                  skills: [...(profile.skills || []), emptySkill()],
                })
              }
            >
              + Add skill category
            </button>
          </div>
          {(profile.skills || []).map((group, index) => (
            <div key={`skill-${index}`} className="admin-repeat-card">
              <div className="admin-grid-2">
                <label>
                  Category
                  <input
                    value={group.name}
                    placeholder="Cloud"
                    onChange={(e) => updateSkill(index, { name: e.target.value })}
                  />
                </label>
                <label>
                  Skills (comma separated)
                  <input
                    value={(group.items || []).map((i) => i.label).join(', ')}
                    placeholder="AWS, Kubernetes, Terraform"
                    onChange={(e) => updateSkill(index, { itemsText: e.target.value })}
                  />
                </label>
              </div>
              <button
                type="button"
                className="admin-btn secondary danger-text"
                onClick={() =>
                  setProfile({
                    ...profile,
                    skills: (profile.skills || []).filter((_, i) => i !== index),
                  })
                }
              >
                Remove
              </button>
            </div>
          ))}
        </section>

        <label>
          Avatar image
          <input
            type="file"
            accept="image/*"
            onChange={(e) => void onUploadAvatar(e.target.files?.[0] || null)}
          />
        </label>
        {profile.avatar && (
          <div className="admin-image-preview">
            <img src={profile.avatar} alt="" />
          </div>
        )}

        <div className="admin-resume-block">
          <label>
            Resume / CV (PDF)
            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={(e) => void onUploadResume(e.target.files?.[0] || null)}
            />
          </label>
          {profile.resumeUrl ? (
            <div className="admin-resume-row">
              <a href={profile.resumeUrl} target="_blank" rel="noreferrer">
                View attached resume
              </a>
              <button
                type="button"
                className="admin-btn secondary"
                onClick={() => setProfile({ ...profile, resumeUrl: '' })}
              >
                Remove
              </button>
            </div>
          ) : (
            <p className="admin-lead">No resume attached yet. Upload a PDF for the Download CV button.</p>
          )}
        </div>

        <button type="submit" className="admin-btn" disabled={busy}>
          {busy ? 'Saving…' : 'Save profile'}
        </button>
      </form>
    </div>
  )
}
