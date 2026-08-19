import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface DrillProgress {
  mcqCorrect: boolean
  fixed: boolean
}

interface ProgressState {
  progress: Record<string, DrillProgress>
  markMcqCorrect: (drillId: string) => void
  markFixed: (drillId: string) => void
  reset: () => void
  isComplete: (drillId: string) => boolean
}

const empty: DrillProgress = { mcqCorrect: false, fixed: false }

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      progress: {},
      markMcqCorrect: (drillId) =>
        set((s) => ({
          progress: {
            ...s.progress,
            [drillId]: { ...(s.progress[drillId] ?? empty), mcqCorrect: true },
          },
        })),
      markFixed: (drillId) =>
        set((s) => ({
          progress: {
            ...s.progress,
            [drillId]: { ...(s.progress[drillId] ?? empty), fixed: true },
          },
        })),
      reset: () => set({ progress: {} }),
      isComplete: (drillId) => {
        const p = get().progress[drillId]
        return Boolean(p?.mcqCorrect && p?.fixed)
      },
    }),
    { name: 'perf-drills-progress' },
  ),
)
