export const profile = {
  name: 'Alex Rivera',
  given: 'Alex',
  family: 'Rivera',
  pronouns: 'he/him',
  role: 'Senior DevOps Engineer',
  organization: 'CloudScale Systems',
  organizationUrl: 'https://example.com',
  avatar: '/avatar.png',
  email: 'alex.rivera@example.com',
  bio: `Alex Rivera is a Senior DevOps Engineer at CloudScale Systems. He designs and operates
cloud-native platforms at scale, with deep expertise in Kubernetes, CI/CD, and infrastructure as code.
Alex focuses on reliability, developer experience, and secure delivery pipelines.`,
  about: `I build and run production platforms that help engineering teams ship faster with confidence.
My work spans Kubernetes, Terraform, observability, and GitOps — applying automation and SRE practices
to keep systems reliable at scale.

I write about platform engineering, incident response, and cloud architecture. Reach out to collaborate.`,
  links: [
    { label: 'E-mail Me', url: 'mailto:alex.rivera@example.com', icon: 'email' as const },
    { label: 'GitHub', url: 'https://github.com/example', icon: 'github' as const },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/example/', icon: 'linkedin' as const },
    { label: 'X', url: 'https://x.com/example', icon: 'x' as const },
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

export type Profile = typeof profile
