import { useLiveQuery } from 'dexie-react-hooks';
import type { Session } from '../domain/types';
import { db } from './db';

/**
 * All session persistence goes through here. Records carry a uuid,
 * `updatedAt` and a soft-delete `deletedAt`, so a cloud sync backend can be
 * added later behind this interface without touching the screens.
 */
export interface SessionRepo {
  list(): Promise<Session[]>;
  add(s: Session): Promise<void>;
  remove(id: string): Promise<void>;
  /** Upsert, keeping whichever copy has the newer `updatedAt`. */
  merge(sessions: Session[]): Promise<number>;
}

export const sessionRepo: SessionRepo = {
  async list() {
    const all = await db.sessions.orderBy('createdAt').reverse().toArray();
    return all.filter((s) => !s.deletedAt);
  },
  async add(s) {
    await db.sessions.put(s);
  },
  async remove(id) {
    const now = Date.now();
    await db.sessions.update(id, { deletedAt: now, updatedAt: now });
  },
  async merge(incoming) {
    return db.transaction('rw', db.sessions, async () => {
      let n = 0;
      for (const s of incoming) {
        const existing = await db.sessions.get(s.id);
        if (!existing || existing.updatedAt < s.updatedAt) {
          await db.sessions.put(s);
          n++;
        }
      }
      return n;
    });
  },
};

/** Live list of non-deleted sessions, newest first. `undefined` while loading. */
export function useSessions(): Session[] | undefined {
  return useLiveQuery(() => sessionRepo.list(), []);
}
