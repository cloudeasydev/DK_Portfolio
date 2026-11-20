import { Biography } from '@/components/Biography'
import {
  AboutSection,
  CertificationsSection,
  FeaturedArticles,
  SkillsSection,
} from '@/components/Sections'

export default function HomePage() {
  return (
    <>
      <Biography />
      <AboutSection />
      <FeaturedArticles />
      <SkillsSection />
      <CertificationsSection />
    </>
  )
}
