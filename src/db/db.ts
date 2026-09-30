import Dexie, { type EntityTable } from 'dexie';
import type { Session } from '../domain/types';

export const db = new Dexie('circuit20') as Dexie & {
  sessions: EntityTable<Session, 'id'>;
};

db.version(1).stores({
  sessions: 'id, createdAt, updatedAt',
});
