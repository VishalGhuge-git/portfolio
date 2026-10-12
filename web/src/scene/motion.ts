// True when the visitor asks the OS for less motion: no floating objects, no auto-advancing tour.
export const REDUCE = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
