import { useLiveQuery } from 'dexie-react-hooks';
import type { Table } from 'dexie';
import type { SavedWorkout, Session } from '../domain/types';
import { db } from './db';

/**
 * All persistence goes through here. Records carry a uuid, `updatedAt` and a
 * soft-delete `deletedAt`, so a cloud sync backend can be added later behind
 * these interfaces without touching the screens.
 */
interface Repo<T> {
  list(): Promise<T[]>;
  add(s: T): Promise<void>;
  remove(id: string): Promise<void>;
  /** Upsert, keeping whichever copy has the newer `updatedAt`. */
  merge(items: T[]): Promise<number>;
}

type Synced = { id: string; createdAt: number; updatedAt: number; deletedAt?: number };

function makeRepo<T extends Synced>(table: Table<T, string>, newestFirst: boolean): Repo<T> {
  return {
    async list() {
      const ordered = table.orderBy('createdAt');
      const all = await (newestFirst ? ordered.reverse() : ordered).toArray();
      return all.filter((s) => !s.deletedAt);
    },
    async add(s) {
      await table.put(s);
    },
    async remove(id) {
      const now = Date.now();
      await table.update(id, (s) => { s.deletedAt = now; s.updatedAt = now; });
    },
    async merge(incoming) {
      return db.transaction('rw', table, async () => {
        let n = 0;
        for (const s of incoming) {
          const existing = await table.get(s.id);
          if (!existing || existing.updatedAt < s.updatedAt) {
            await table.put(s);
            n++;
          }
        }
        return n;
      });
    },
  };
}

export type SessionRepo = Repo<Session>;
export type SavedWorkoutRepo = Repo<SavedWorkout>;

export const sessionRepo: SessionRepo = makeRepo(db.sessions, true);
/** Oldest first, so the built-in workouts stay at the top. */
export const savedWorkoutRepo: SavedWorkoutRepo = makeRepo(db.savedWorkouts, false);

/** Live list of non-deleted sessions, newest first. `undefined` while loading. */
export function useSessions(): Session[] | undefined {
  return useLiveQuery(() => sessionRepo.list(), []);
}

/** Live list of non-deleted saved workouts, oldest first. `undefined` while loading. */
export function useSavedWorkouts(): SavedWorkout[] | undefined {
  return useLiveQuery(() => savedWorkoutRepo.list(), []);
}
