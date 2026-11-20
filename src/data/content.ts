export type Project = {
  id: string
  title: string
  summary: string
  tags: string[]
  url: string
  featured?: boolean
  date: string
}

export type Article = {
  id: string
  title: string
  summary: string
  venue: string
  date: string
  tags: string[]
  featured?: boolean
  links: { label: string; url: string }[]
}

export const projects: Project[] = [
  {
    id: 'gitops-platform',
    title: 'GitOps Delivery Platform',
    summary:
      'Multi-cluster Argo CD platform with progressive delivery, policy-as-code, and self-service app onboarding for 150+ microservices.',
    tags: ['Kubernetes', 'Argo CD', 'GitOps'],
    url: 'https://github.com/example/gitops-platform',
    featured: true,
    date: '2024-06',
  },
  {
    id: 'terraform-modules',
    title: 'Cloud Terraform Modules',
    summary:
      'Reusable Terraform module library for AWS networking, EKS, RDS, and observability baselines used across 40+ environments.',
    tags: ['Terraform', 'AWS', 'IaC'],
    url: 'https://github.com/example/terraform-modules',
    featured: true,
    date: '2023-11',
  },
  {
    id: 'observability-stack',
    title: 'Unified Observability Stack',
    summary:
      'Prometheus, Loki, Tempo, and Grafana stack with SLO dashboards, alert routing, and runbook automation.',
    tags: ['Prometheus', 'Grafana', 'SRE'],
    url: 'https://github.com/example/observability-stack',
    featured: true,
    date: '2023-04',
  },
  {
    id: 'ci-templates',
    title: 'Secure CI Pipeline Templates',
    summary:
      'GitHub Actions reusable workflows with SAST, container scanning, SBOM generation, and signed image promotion.',
    tags: ['CI/CD', 'Security', 'Supply Chain'],
    url: 'https://github.com/example/ci-templates',
    date: '2022-09',
  },
]

export const articles: Article[] = [
  {
    id: 'zero-downtime-eks',
    title: 'Zero-Downtime Multi-Region EKS Migration',
    summary:
      'A practical playbook for migrating production workloads across regions without customer-facing downtime using blue/green and traffic shifting.',
    venue: 'Platform Engineering Conf',
    date: '2024-09',
    tags: ['Kubernetes', 'AWS'],
    featured: true,
    links: [
      { label: 'PDF', url: '#' },
      { label: 'Code', url: 'https://github.com/example' },
      { label: 'Slides', url: '#' },
    ],
  },
  {
    id: 'gitops-at-scale',
    title: 'GitOps at Scale: Lessons from 200 Microservices',
    summary:
      'Patterns for structuring repositories, environments, and promotion pipelines when dozens of teams share one delivery platform.',
    venue: 'KubeCon + CloudNativeCon',
    date: '2023-11',
    tags: ['GitOps', 'Argo CD'],
    featured: true,
    links: [
      { label: 'PDF', url: '#' },
      { label: 'Video', url: '#' },
    ],
  },
  {
    id: 'slo-driven-alerts',
    title: 'SLO-Driven Alerting That Engineers Actually Trust',
    summary:
      'How we cut alert noise by 60% by redesigning SLIs, error budgets, and on-call ownership around customer-facing outcomes.',
    venue: 'SRE Weekly',
    date: '2023-03',
    tags: ['SRE', 'Observability'],
    links: [{ label: 'Article', url: '#' }],
  },
  {
    id: 'terraform-governance',
    title: 'Terraform Governance Without Slowing Teams Down',
    summary:
      'Policy-as-code, module versioning, and plan review workflows that keep infrastructure consistent while preserving developer velocity.',
    venue: 'HashiConf',
    date: '2022-10',
    tags: ['Terraform', 'Governance'],
    links: [
      { label: 'PDF', url: '#' },
      { label: 'Code', url: 'https://github.com/example' },
    ],
  },
]

export const navLinks = [
  { name: 'About', path: '/#about' },
  { name: 'Articles', path: '/#articles' },
  { name: 'Skills', path: '/#skills' },
  { name: 'Certs', path: '/#certifications' },
  { name: 'Experience', path: '/experience' },
  { name: 'Projects', path: '/projects' },
]
