// The guided tour in Explore 3D: every clickable item in order, with Vishal himself in between.
export interface Stop { id: string; name: string; sub: string; year?: string; blurb?: string; me?: 'face' | 'body'; slug?: string; scrollTo?: string }
// Newest first. Years and blurbs come from the résumé entries in src/ui/Resume.tsx.
export const TOUR: readonly Stop[] = [
  { id: 'me1', name: 'Vishal Ghuge', sub: 'Product Manager, Fractal Analytics', year: '2026', blurb: 'Product manager across AI, SaaS and OTT. Tap through the desk to see the work, newest first.', me: 'face' },
  { id: 'iqigai', name: 'iqigai', sub: 'AI staffing platform', year: '2025 – Now', blurb: 'Built 0 to 1 and used organisation-wide, xxxx+ daily active users. Six AI agents, 7-member team.', slug: 'iqigai' },
  { id: 'te', name: 'Total Environment', sub: '3D property platform', year: '2024 – 2025', blurb: 'B2C home-buyer portal plus a B2B 3D design tool (Foyr Neo): 300+ screens, 32+ user flows.', slug: 'total-environment' },
  { id: 'me2', name: 'Vishal Ghuge', sub: 'AI · SaaS · 0 to 1', year: '2020 – Now', blurb: 'From content operations to AI-native products, with a master\'s in business along the way.', me: 'body' },
  { id: 'foyr', name: 'Foyr Ideate', sub: 'AI interior design MVP', year: '2024', blurb: 'Auto-furnish an empty room from a photo, swap styles and restyle any space. Directed the UI/UX agency.', slug: 'foyr-ideate' },
  { id: 'bocconi', name: 'SDA Bocconi School of Management', sub: 'Italy', year: '2022 – 2024', blurb: 'International Master in Business at SDA Bocconi School of Management, Italy.', scrollTo: 'education' },
  { id: 'mx', name: 'Amazon MX Player', sub: 'Content operations', year: '2020 – 2021', blurb: 'Led a team of 6 managing 300,000+ content units; an API overhaul lifted daily output by 50%.', slug: 'mx-player' },
  { id: 'xaviers', name: "St. Xavier's College", sub: 'BA Economics', year: '2019 – 2021', blurb: 'BA Economics (Majors), plus a London School of Economics summer course in 2019.', scrollTo: 'education' },
]
