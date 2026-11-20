'use client'

import { useContent } from '@/context/ContentContext'
import {
  IconDownload,
  IconEmail,
  IconGitHub,
  IconLinkedIn,
  IconX,
} from './Icons'

const iconMap = {
  email: IconEmail,
  github: IconGitHub,
  linkedin: IconLinkedIn,
  x: IconX,
}

export function Biography() {
  const { profile } = useContent()
  const links = profile.links || []
  const interests = profile.interests || []
  const education = profile.education || []

  return (
    <section className="biography mesh-bg">
      <div className="container biography-grid">
        <div className="bio-avatar-col">
          <img
            src={profile.avatar || '/avatar.png'}
            alt={profile.name}
            className="avatar"
            width={200}
            height={200}
          />
          <div className="social-row">
            {links.map((link) => {
              const Icon = iconMap[(link.icon as keyof typeof iconMap) || 'email'] || IconEmail
              return (
                <a
                  key={link.label}
                  href={link.url}
                  className="social-link"
                  target={link.url.startsWith('mailto:') ? undefined : '_blank'}
                  rel={link.url.startsWith('mailto:') ? undefined : 'noreferrer'}
                  aria-label={link.label}
                  title={link.label}
                >
                  <Icon />
                </a>
              )
            })}
          </div>
          <a
            className="btn btn-primary"
            href={profile.resumeUrl || '/resume.pdf'}
            target="_blank"
            rel="noreferrer"
            download
          >
            <IconDownload />
            Download CV
          </a>
        </div>

        <div className="bio-main">
          <p className="eyebrow">{profile.pronouns}</p>
          <h1 className="bio-name">{profile.name}</h1>
          <p className="bio-role">
            {profile.role}
            {profile.organization && (
              <>
                {' · '}
                <a href={profile.organizationUrl} target="_blank" rel="noreferrer">
                  {profile.organization}
                </a>
              </>
            )}
          </p>
          <p className="bio-text">{profile.bio}</p>
        </div>

        <aside className="bio-aside">
          <div className="aside-block">
            <h2>Interests</h2>
            <ul className="chip-list">
              {interests.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="aside-block">
            <h2>Education</h2>
            <ul className="edu-list">
              {education.map((edu) => (
                <li key={edu.degree}>
                  <strong>{edu.degree}</strong>
                  <span>
                    {edu.institution}, {edu.start}–{edu.end}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </section>
  )
}
