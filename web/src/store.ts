import { create } from 'zustand'

// Shared UI state.
// `active` is the project whose case study is open, as its works.ts key (`slug`, or `name` when an
// item has no slug). Both the Works gallery and the 3D stickers set it, so either opens the same view.
interface StoreState {
  active: string | null
  setActive: (key: string | null) => void
  // sticker id the camera should zoom to while its résumé section is on screen
  // true after the first sticker interaction (hides the "tap the stickers" hint)
  touched: boolean
  focus: string | null
  setFocus: (id: string | null) => void
  // 3D explore mode: free camera views of Vishal / the desk, instead of the scroll-driven camera
  explore: null | 'person' | 'desk' | 'wide'
  setExplore: (v: null | 'person' | 'desk' | 'wide') => void
}

export const useStore = create<StoreState>((set) => ({
  active: null,
  setActive: (key) => set(key ? { active: key, touched: true } : { active: null }),
  touched: false,
  focus: null,
  setFocus: (id) => set((st) => (st.focus === id ? st : { focus: id })),
  explore: null,
  setExplore: (v) => set({ explore: v }),
}))

// Dev-only console hook, e.g. __store.getState().setActive('iqigai')
declare global {
  interface Window {
    __store?: typeof useStore
  }
}
if (import.meta.env.DEV) window.__store = useStore
