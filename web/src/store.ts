import { create } from 'zustand'

// Shared UI state.
// `active` is the project whose case study is open, as its works.ts key (`slug`, or `name` when an
// item has no slug). Both the Works gallery and the 3D stickers set it, so either opens the same view.
interface StoreState {
  active: string | null
  setActive: (key: string | null) => void
}

export const useStore = create<StoreState>((set) => ({
  active: null,
  setActive: (key) => set({ active: key }),
}))

// Dev-only console hook, e.g. __store.getState().setActive('iqigai')
declare global {
  interface Window {
    __store?: typeof useStore
  }
}
if (import.meta.env.DEV) window.__store = useStore
