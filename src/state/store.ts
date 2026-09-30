import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ActiveRun, Draft, Equipment } from '../domain/types';

interface AppState {
  equipment: Equipment[];
  draft: Draft | null;
  run: ActiveRun | null;
  setEquipment(eq: Equipment[]): void;
  setDraft(d: Draft | null): void;
  setRun(r: ActiveRun | null): void;
  updateRun(fn: (r: ActiveRun) => ActiveRun): void;
}

/**
 * Small, synchronous app state (prefs, current draft, in-progress run),
 * persisted to localStorage so a reload mid-workout resumes exactly.
 */
export const useApp = create<AppState>()(
  persist(
    (set) => ({
      equipment: ['mat', 'dumbbells', 'pullupBar'],
      draft: null,
      run: null,
      setEquipment: (equipment) => set({ equipment }),
      setDraft: (draft) => set({ draft }),
      setRun: (run) => set({ run }),
      updateRun: (fn) => set((s) => (s.run ? { run: fn(s.run) } : s)),
    }),
    { name: 'circuit20', version: 1 },
  ),
);
