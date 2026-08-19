import { create } from 'zustand'

interface UIState {
  selectedId: string | null
  select: (id: string) => void
  close: () => void
}

export const useUIStore = create<UIState>((set) => ({
  selectedId: null,
  select: (id) => set({ selectedId: id }),
  close: () => set({ selectedId: null }),
}))
