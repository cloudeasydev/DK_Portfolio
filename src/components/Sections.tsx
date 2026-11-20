'use client'

import Link from 'next/link'
import { useContent } from '@/context/ContentContext'
import { IconExternal, IconTrophy } from './Icons'

export function AboutSection() {
  const { profile } = useContent()
  return (
    <section className="section" id="about">
      <div className="container narrow">
        <h2 className="section-title">Platform Engineering</h2>
        <p className="prose">{profile.about}</p>
      </div>
    </section>
  )
}

export function FeaturedArticles() {
  const { articles } = useContent()
  const list = articles.filter((a) => a.featured).length
    ? articles.filter((a) => a.featured)
    : articles

  return (
    <section className="section" id="articles">
      <div className="container">
        <h2 className="section-title">Featured Articles</h2>
        {list.length === 0 ? (
          <p className="prose">No public articles yet. Publish a blog post from Admin.</p>
        ) : (
          <div className="card-grid two">
            {list.map((article) => (
              <article key={article._id} className="card feature-card">
                <Link href={`/articles/${article._id}`} className="article-card-link">
                  {article.imageUrl && (
                    <img src={article.imageUrl} alt="" className="article-thumb" />
                  )}
                  <div className="card-meta">
                    <span>{article.venue || 'Article'}</span>
                    <time>{article.date}</time>
                  </div>
                  <h3>{article.title}</h3>
                  <p>{article.summary}</p>
                </Link>
                <div className="tag-row">
                  {(article.tags || []).map((t) => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="link-row">
                  <Link href={`/articles/${article._id}`}>Read article</Link>
                  {(article.links || []).map((l) => (
                    <a key={l.label} href={l.url}>
                      {l.label}
                    </a>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export function SkillsSection() {
  const { profile } = useContent()
  const skills = profile.skills || []
  return (
    <section className="section muted" id="skills">
      <div className="container">
        <h2 className="section-title">Skills</h2>
        <div className="table-wrap">
          <table className="skills-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Skills</th>
              </tr>
            </thead>
            <tbody>
              {skills.map((group) => (
                <tr key={group.name}>
                  <td className="skill-category">{group.name}</td>
                  <td>{(group.items || []).map((item) => item.label).join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export function CertificationsSection() {
  const { profile } = useContent()
  const certifications = profile.certifications || []
  return (
    <section className="section" id="certifications">
      <div className="container">
        <h2 className="section-title">Certifications</h2>
        <ul className="cert-list">
          {certifications.map((cert) => (
            <li key={cert.name} className="card">
              <strong>{cert.name}</strong>
              <span>
                {cert.issuer} · {cert.year}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function ProjectsSection({ featuredOnly = false }: { featuredOnly?: boolean }) {
  const { projects } = useContent()
  const list = featuredOnly ? projects.filter((p) => p.featured) : projects

  return (
    <section className="section" id="projects">
      <div className="container">
        {!featuredOnly && <h2 className="section-title">Projects</h2>}
        <div className="card-grid three">
          {list.map((project) => (
            <article key={project._id} className="card project-card">
              {project.imageUrl && <img src={project.imageUrl} alt="" className="article-thumb" />}
              <div className="card-meta">
                <time>{project.date}</time>
              </div>
              <h3>
                <a href={project.url} target="_blank" rel="noreferrer">
                  {project.title} <IconExternal className="inline-icon" />
                </a>
              </h3>
              <p>{project.summary}</p>
              <div className="tag-row">
                {(project.tags || []).map((t) => (
                  <span key={t} className="tag">
                    {t}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ExperienceContent() {
  const { profile } = useContent()
  const experience = profile.experience || []
  const education = profile.education || []
  const awards = profile.awards || []
  const languages = profile.languages || []

  return (
    <>
      <section className="section">
        <div className="container experience-layout">
          <div>
            <h2 className="section-title">Experience</h2>
            <ol className="timeline">
              {experience.map((job) => (
                <li key={`${job.role}-${job.org}`}>
                  <div className="timeline-dot" />
                  <div className="timeline-body">
                    <h3>{job.role}</h3>
                    <p className="timeline-org">
                      {job.org} · {job.start} – {job.end}
                    </p>
                    <p>{job.summary}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h2 className="section-title">Education</h2>
            <ol className="timeline">
              {education.map((edu) => (
                <li key={edu.degree}>
                  <div className="timeline-dot" />
                  <div className="timeline-body">
                    <h3>{edu.degree}</h3>
                    <p className="timeline-org">
                      {edu.institution} · {edu.start} – {edu.end}
                    </p>
                    {edu.summary && <p>{edu.summary}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <SkillsSection />
      <CertificationsSection />

      <section className="section">
        <div className="container split-2">
          <div>
            <h2 className="section-title">Awards</h2>
            <ul className="award-list">
              {awards.map((award) => (
                <li key={award.title}>
                  <IconTrophy className="award-icon" />
                  <div>
                    <strong>{award.title}</strong>
                    <span>
                      {award.awarder} · {award.date}
                    </span>
                    <p>{award.summary}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="section-title">Languages</h2>
            <ul className="lang-list">
              {languages.map((lang) => (
                <li key={lang.name}>
                  <div className="skill-label">
                    <strong>{lang.name}</strong>
                    <span>{lang.label}</span>
                  </div>
                  <div className="skill-bar" aria-hidden>
                    <span style={{ width: `${(lang.level / 5) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  )
}
