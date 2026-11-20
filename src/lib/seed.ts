import bcrypt from 'bcryptjs'
import { Blog, Profile, Project, User } from './models'

const defaultProfile = {
  name: 'Alex Rivera',
  given: 'Alex',
  family: 'Rivera',
  pronouns: 'he/him',
  role: 'Senior DevOps Engineer',
  organization: 'CloudScale Systems',
  organizationUrl: 'https://example.com',
  avatar: '/avatar.png',
  email: 'alex.rivera@example.com',
  bio: `Alex Rivera is a Senior DevOps Engineer at CloudScale Systems. He designs and operates cloud-native platforms at scale, with deep expertise in Kubernetes, CI/CD, and infrastructure as code. Alex focuses on reliability, developer experience, and secure delivery pipelines.`,
  about: `I build and run production platforms that help engineering teams ship faster with confidence. My work spans Kubernetes, Terraform, observability, and GitOps — applying automation and SRE practices to keep systems reliable at scale.

I write about platform engineering, incident response, and cloud architecture. Reach out to collaborate.`,
  links: [
    { label: 'E-mail Me', url: 'mailto:alex.rivera@example.com', icon: 'email' },
    { label: 'GitHub', url: 'https://github.com/example', icon: 'github' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/example/', icon: 'linkedin' },
    { label: 'X', url: 'https://x.com/example', icon: 'x' },
  ],
  interests: [
    'Kubernetes & Cloud Native',
    'CI/CD & GitOps',
    'Infrastructure as Code',
    'Site Reliability Engineering',
  ],
  education: [
    {
      degree: 'MS Computer Science',
      institution: 'Stanford University',
      start: '2015',
      end: '2017',
      summary:
        'Focus on distributed systems and cloud computing. Thesis on automated capacity planning for microservices.',
    },
    {
      degree: 'BS Computer Science',
      institution: 'UC Berkeley',
      start: '2011',
      end: '2015',
    },
  ],
  experience: [
    {
      role: 'Senior DevOps Engineer',
      org: 'CloudScale Systems',
      start: 'Jan 2021',
      end: 'Present',
      summary:
        'Lead platform engineering for multi-cloud Kubernetes. Built GitOps delivery, observability stack, and self-service developer tooling serving 200+ engineers.',
    },
    {
      role: 'DevOps Engineer',
      org: 'FinTech Labs',
      start: 'Jun 2018',
      end: 'Dec 2020',
      summary:
        'Migrated monolith workloads to AWS EKS. Implemented Terraform modules, Jenkins-to-GitHub Actions migration, and 99.95% SLA for payment APIs.',
    },
    {
      role: 'Site Reliability Intern',
      org: 'Stripe',
      start: 'Jun 2017',
      end: 'Aug 2017',
      summary:
        'Built alerting runbooks and reduced PagerDuty noise by 40%. Contributed to internal deployment tooling.',
    },
  ],
  skills: [
    {
      name: 'Platform & Cloud',
      items: [
        { label: 'Kubernetes', level: 5 },
        { label: 'AWS / GCP', level: 5 },
        { label: 'Terraform', level: 5 },
        { label: 'Docker', level: 5 },
      ],
    },
    {
      name: 'Delivery & Automation',
      items: [
        { label: 'CI/CD (GitHub Actions, Argo CD)', level: 5 },
        { label: 'Python / Go / Bash', level: 4 },
        { label: 'Ansible', level: 4 },
        { label: 'Linux Administration', level: 5 },
      ],
    },
    {
      name: 'Reliability & Security',
      items: [
        { label: 'Prometheus / Grafana', level: 5 },
        { label: 'Incident Response', level: 4 },
        { label: 'Security & Compliance', level: 4 },
      ],
    },
  ],
  languages: [
    { name: 'English', level: 5, label: 'Native' },
    { name: 'Spanish', level: 4, label: 'Fluent' },
  ],
  awards: [
    {
      title: 'Platform Excellence Award',
      awarder: 'CloudScale Systems',
      date: '2024',
      summary: 'Recognized for delivering a zero-downtime multi-region Kubernetes migration.',
    },
    {
      title: 'CNCF Contributor Spotlight',
      awarder: 'Cloud Native Computing Foundation',
      date: '2023',
      summary: 'Highlighted for open-source contributions to Argo and Kubernetes tooling.',
    },
  ],
  certifications: [
    { name: 'CKA — Certified Kubernetes Administrator', issuer: 'CNCF', year: '2023' },
    { name: 'CKAD — Certified Kubernetes Application Developer', issuer: 'CNCF', year: '2023' },
    { name: 'AWS Solutions Architect — Professional', issuer: 'Amazon Web Services', year: '2022' },
    { name: 'AWS DevOps Engineer — Professional', issuer: 'Amazon Web Services', year: '2022' },
    { name: 'HashiCorp Terraform Associate', issuer: 'HashiCorp', year: '2021' },
    { name: 'GitHub Actions Certificate', issuer: 'GitHub', year: '2021' },
  ],
}

const defaultBlogs = [
  {
    title: 'Zero-Downtime Multi-Region EKS Migration',
    summary:
      'A practical playbook for migrating production workloads across regions without customer-facing downtime using blue/green and traffic shifting.',
    venue: 'Platform Engineering Conf',
    date: '2024-09',
    tags: ['Kubernetes', 'AWS'],
    featured: true,
    visibility: 'public',
    links: [
      { label: 'PDF', url: '#' },
      { label: 'Code', url: 'https://github.com/example' },
    ],
  },
  {
    title: 'GitOps at Scale: Lessons from 200 Microservices',
    summary:
      'Patterns for structuring repositories, environments, and promotion pipelines when dozens of teams share one delivery platform.',
    venue: 'KubeCon + CloudNativeCon',
    date: '2023-11',
    tags: ['GitOps', 'Argo CD'],
    featured: true,
    visibility: 'public',
    links: [
      { label: 'PDF', url: '#' },
      { label: 'Video', url: '#' },
    ],
  },
  {
    title: 'Draft: Internal Platform Notes',
    summary: 'Private draft — only visible in admin until published.',
    venue: 'Internal',
    date: '2025-01',
    tags: ['Draft'],
    featured: false,
    visibility: 'private',
    links: [],
  },
]

const defaultProjects = [
  {
    title: 'GitOps Delivery Platform',
    summary:
      'Multi-cluster Argo CD platform with progressive delivery, policy-as-code, and self-service app onboarding for 150+ microservices.',
    tags: ['Kubernetes', 'Argo CD', 'GitOps'],
    url: 'https://github.com/example/gitops-platform',
    featured: true,
    date: '2024-06',
  },
  {
    title: 'Cloud Terraform Modules',
    summary:
      'Reusable Terraform module library for AWS networking, EKS, RDS, and observability baselines used across 40+ environments.',
    tags: ['Terraform', 'AWS', 'IaC'],
    url: 'https://github.com/example/terraform-modules',
    featured: true,
    date: '2023-11',
  },
  {
    title: 'Unified Observability Stack',
    summary:
      'Prometheus, Loki, Tempo, and Grafana stack with SLO dashboards, alert routing, and runbook automation.',
    tags: ['Prometheus', 'Grafana', 'SRE'],
    url: 'https://github.com/example/observability-stack',
    featured: true,
    date: '2023-04',
  },
  {
    title: 'Secure CI Pipeline Templates',
    summary:
      'GitHub Actions reusable workflows with SAST, container scanning, SBOM generation, and signed image promotion.',
    tags: ['CI/CD', 'Security', 'Supply Chain'],
    url: 'https://github.com/example/ci-templates',
    featured: false,
    date: '2022-09',
  },
]

let seeded = false

export async function seedIfEmpty() {
  if (seeded) return
  seeded = true
  await syncAdminUser()

  if ((await Profile.countDocuments()) === 0) await Profile.create(defaultProfile)
  if ((await Blog.countDocuments()) === 0) await Blog.insertMany(defaultBlogs)
  if ((await Project.countDocuments()) === 0) await Project.insertMany(defaultProjects)
}

export async function syncAdminUser() {
  const email = (process.env.ADMIN_EMAIL || 'divyanshu1300@gmail.com').toLowerCase()
  const password = process.env.ADMIN_PASSWORD || 'Div@123@456#'
  const passwordHash = await bcrypt.hash(password, 10)

  // Always sync admin credentials from .env so login never drifts
  await User.findOneAndUpdate(
    { email },
    { email, passwordHash, role: 'admin' },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  )

  return email
}

export async function ensureDb() {
  const { connectDb } = await import('./db')
  await connectDb()
  await seedIfEmpty()
}
