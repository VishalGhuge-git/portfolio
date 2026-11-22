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
        id: 'led',
        no: '01',
        title: 'Products I led',
        tagline: 'Fractal · Foyr · Total Environment · Amazon MX Player',
        items: [
          {
            name: 'iqigai',
            meta: 'Matches bench people to open roles, and explains every recommendation',
            tags: ['Spreadsheets → one platform', 'xxxx+ daily users', '6 AI agents'],
            slug: 'iqigai',
          },
          {
            name: 'Total Environment',
            meta: 'Designers build homes in 3D on the web; buyers explore and choose in the same pipeline',
            tags: ['Desktop CAD → web', '300+ screens', 'Org-wide rollout'],
            slug: 'total-environment',
          },
          {
            name: 'Foyr Ideate',
            meta: 'Takes a room from empty or tired to a design direction, with AI',
            tags: ['0 → MVP in 5 months', 'Freemium pricing model'],
            link: 'https://ideate.foyr.com',
            slug: 'foyr-ideate',
          },
          {
            name: 'Amazon MX Player',
            meta: 'Turned a content backlog with no process into a pipeline that ships on time',
            tags: ['300,000+ content units', '+50% output in a month', '56 shows live in a week'],
            slug: 'mx-player',
          },
        ],
      },
      {
        id: 'ai-builds',
        no: '02',
        title: 'AI work I built',
        tagline: 'Solo builds, end to end with AI tools',
        items: [
          {
            name: 'POPM Prep',
            meta: 'Exam practice that shows where you stand and teaches with every answer',
            tags: ['374 questions', 'Adaptive mock exam', 'Passed POPM with 100%'],
            slug: 'pmpo-portal',
          },
          {
            name: 'Indian Stock Market News Brief',
            meta: 'One 6-to-8-minute morning email instead of five noisy sources',
            tags: ['Every number cross-checked', 'Runs unattended daily'],
            slug: 'indian-market-brief',
          },
          {
            name: 'Garu',
            meta: 'A real product lesson, told as a short animated story',
            tags: ['Users wanted trust, not filters', 'Episode 1'],
            slug: 'garu-animated-video',
          },
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
