// Kind words: a letter of appreciation and LinkedIn recommendations, quoted verbatim (trimmed, never reworded).
// `featured` items show first; the rest sit behind "Show more". `slug` ties a quote to a case study,
// where it also appears under the Why / How / Outcome summary.

export interface Recognition {
  quote: string
  name: string
  role: string // their current title, as on LinkedIn
  context: string // how they know Vishal
  kind: 'letter' | 'recommendation'
  featured?: boolean
  slug?: string
}

export const RECOGNITION: Recognition[] = [
  {
    kind: 'letter',
    featured: true,
    slug: 'total-environment',
    quote:
      'Your dedication, problem-solving mindset, and consistent focus on quality have played a pivotal role in moving this ambitious initiative forward. The professionalism and ownership you’ve demonstrated have not only impacted the project but have also inspired those around you.',
    name: 'Shailesh Goswami',
    role: 'Founder & CEO, Foyr',
    context: 'Letter of appreciation for the Total Environment project · Sep 2025',
  },
  {
    kind: 'recommendation',
    featured: true,
    slug: 'iqigai',
    quote:
      'Vishal played a pivotal role in leading the development of the Staffing Tool from the ground up, owning the initiative end-to-end and ensuring its successful delivery. What stands out most about Vishal is his reliability and strong sense of ownership.',
    name: 'Gurmeet Phougat',
    role: 'Product Manager, Strategic Center, Fractal',
    context: 'Worked on the same team at Fractal',
  },
  {
    kind: 'recommendation',
    featured: true,
    slug: 'mx-player',
    quote:
      'One of the most hardworking people that I have met. I got a chance to work with Vishal at Mx Player. He was an efficient manager and made sure all things were completed on time so that our department doesn’t face any issues.',
    name: 'Prishita Gada',
    role: 'Associate Marketing Manager, Prime Video',
    context: 'Worked together at Amazon MX Player',
  },
  {
    kind: 'recommendation',
    quote:
      'Vishal’s structured thought process and drive played an important role in developing our project in collaboration with Google. He stood out as a leader, coordinating between the different aspects and responsibilities of the project.',
    name: 'Maximilian Borkowsky',
    role: 'KPMG PE Group',
    context: 'Same team at Bocconi, Google Italy project',
  },
  {
    kind: 'recommendation',
    quote:
      'He demonstrated excellent leadership skills, serving as a reference point for different departments, and showcased exceptional communication abilities in presenting the project to the company.',
    name: 'Chiara Trimarchi',
    role: 'Junior Brand Manager, Affinity Petcare',
    context: 'Same team at Bocconi, Google Italy project',
  },
  {
    kind: 'recommendation',
    quote:
      'Vishal’s ability to analyze complex problems and devise effective solutions always plays a vital role in the success of the project.',
    name: 'Sanyam Snehi',
    role: 'Product, BOBCARD',
    context: 'Worked on the same team',
  },
  {
    kind: 'recommendation',
    quote:
      'Vishal consistently displayed a keen understanding of team dynamics and went above and beyond to ensure everyone felt heard and valued.',
    name: 'Swati Anwesha',
    role: 'PhD Candidate in Literature, UT Dallas',
    context: 'Peers at St. Xavier’s College',
  },
  {
    kind: 'recommendation',
    quote: 'He works hard and chases what he wants. He’s also a great team player, a compassionate human being, and a great writer!',
    name: 'Riya Desai',
    role: 'Monitoring & Evaluation Specialist',
    context: 'Peers at St. Xavier’s College',
  },
  {
    kind: 'recommendation',
    quote: 'He is not only a talented professional but also a person of integrity and highly reliable.',
    name: 'Sonam Patra',
    role: 'Manager HRBP, IDEMIA',
    context: 'Studied together at St. Xavier’s College',
  },
  {
    kind: 'recommendation',
    quote: 'I can confidently say that Vishal is a highly reliable and smart individual.',
    name: 'Eliza Rodrigues',
    role: 'Economist, L&T Finance',
    context: 'Studied together at St. Xavier’s College',
  },
]

export function quoteFor(slug?: string): Recognition | undefined {
  return slug ? RECOGNITION.find((r) => r.slug === slug) : undefined
}
