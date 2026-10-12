// The guided tour in Explore 3D: every clickable item in order, with Vishal himself in between.
export interface Stop { id: string; name: string; sub: string; me?: 'face' | 'body'; slug?: string; scrollTo?: string }
export const TOUR: readonly Stop[] = [
  { id: 'me1', name: 'Vishal Ghuge', sub: 'Product Manager, Fractal Analytics', me: 'face' },
  { id: 'iqigai', name: 'iqigai', sub: 'AI staffing platform at Fractal', slug: 'iqigai' },
  { id: 'mx', name: 'Amazon MX Player', sub: 'Content operations', slug: 'mx-player' },
  { id: 'te', name: 'Total Environment', sub: '3D property platform', slug: 'total-environment' },
  { id: 'me2', name: 'Vishal Ghuge', sub: 'AI · SaaS · 0 to 1', me: 'body' },
  { id: 'xaviers', name: "St. Xavier's College", sub: 'Education', scrollTo: 'education' },
  { id: 'foyr', name: 'Foyr Ideate', sub: 'AI interior design MVP', slug: 'foyr-ideate' },
  { id: 'bocconi', name: 'SDA Bocconi', sub: 'Education', scrollTo: 'education' },
]
