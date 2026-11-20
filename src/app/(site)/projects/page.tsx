import { ProjectsSection } from '@/components/Sections'

export default function ProjectsPage() {
  return (
    <main className="page">
      <div className="page-header mesh-bg">
        <div className="container">
          <h1>Projects</h1>
          <p>Platform engineering, infrastructure, and open-source work.</p>
        </div>
      </div>
      <ProjectsSection />
    </main>
  )
}
