// Works gallery data (English only). Pure data: add a project by editing this file.
//
// HOW TO ADD A PROJECT
//   1. Add an item to a section's `items` below, with a unique `slug`.
//   2. Copy src/content/works/_template.md to src/content/works/<slug>.md and fill it in.
//   3. Put images/video in public/works/<slug>/ and reference them as /works/<slug>/file.jpg
//   Items without a matching .md file show the shared placeholder in `detailPlaceholder`.
//
// HOW TO ADD A SECTION
//   Add an object to `sections` (id, no, title, tagline, items). The gallery scrolls horizontally,
//   so any number of sections works.

export interface WorkListItem {
  name: string
  meta?: string
  tags?: string[]
  link?: string
  slug?: string
}

export interface WorkGroup {
  heading: string
  items: string[]
}

export interface WorkSection {
  id: string
  no: string
  title: string
  tagline: string
  items?: WorkListItem[]
  groups?: WorkGroup[]
  awards?: string[]
  footer?: string
}

export interface WorksLang {
  title: string
  closeLabel: string
  openLabel: string
  hint: string
  awardsLabel: string
  visitLabel: string
  detailPlaceholder: string
  phImageLabel: string
  phButtonLabel: string
  countLabel: (n: number) => string
  sections: WorkSection[]
}

export const WORKS: Record<'en', WorksLang> = {
  en: {
    title: 'Works',
    closeLabel: 'Back',
    openLabel: 'Explore',
    hint: 'Keep scrolling',
    awardsLabel: 'Highlights',
    visitLabel: 'Visit site',
    detailPlaceholder:
      'Case study in progress: the problem, the metric, the options I rejected, the decision, and what I would do differently.',
    phImageLabel: 'Screens / prototype',
    phButtonLabel: 'Link',
    countLabel: (n) => `${n} works`,
    sections: [
      {
        id: 'ai',
        no: '01',
        title: 'AI-native products',
        tagline: 'Fractal · Foyr',
        items: [
          {
            name: 'iqigai',
            meta: 'AI recruitment & staffing platform',
            tags: ['1,108+ daily users', '6 AI agents'],
            slug: 'iqigai',
          },
          {
            name: 'Foyr Ideate',
            meta: 'AI interior design MVP',
            link: 'https://ideate.foyr.com',
            slug: 'foyr-ideate',
          },
        ],
      },
      {
        id: 'saas',
        no: '02',
        title: 'B2B & B2C SaaS',
        tagline: 'Total Environment',
        items: [
          {
            name: 'Total Environment',
            meta: 'B2B 3D design tool + B2C buyer portal · 0 to 1',
            tags: ['300+ screens', '32+ flows', '100+ designers'],
            slug: 'total-environment',
          },
        ],
      },
      {
        id: 'ott',
        no: '03',
        title: 'OTT & content ops',
        tagline: 'Amazon MX Player',
        items: [
          {
            name: 'Amazon MX Player',
            meta: 'Content ops, API & CMS overhaul, publisher onboarding',
            tags: ['300,000+ units', '+50% output', '56 shows in 1 week'],
            slug: 'mx-player',
          },
        ],
      },
      {
        id: 'side',
        no: '04',
        title: 'Side builds',
        tagline: 'Built to learn in public',
        items: [
          { name: 'CompanyLens', meta: 'Company intelligence for job seekers', slug: 'companylens' },
          { name: 'PM Job Tracker', meta: 'Concept · daily India PM jobs with resume-fit scoring', slug: 'pm-job-tracker' },
          { name: 'This portfolio', meta: 'Built like a product', slug: 'this-portfolio' },
        ],
      },
    ],
  },
}

// Section cover images shown on the left of each gallery card. Drop a file in public/works/covers/
// named after the section id (e.g. ai.jpg) and register it here. Without one, a numbered
// placeholder is shown.
export const SECTION_COVERS: Record<string, string> = {}

// Count the works in a section (items or groups), used for hover hints
export function sectionCount(section: WorkSection): number {
  if (section.items) return section.items.length
  if (section.groups) return section.groups.reduce((n, g) => n + g.items.length, 0)
  return 0
}
