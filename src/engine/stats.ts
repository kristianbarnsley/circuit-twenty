import type { Session } from '../domain/types';

const DAY_MS = 86_400_000;
const WEEK_MS = 7 * DAY_MS;

/** Score in "exercise units": 3 per full round plus the partial round. */
export function units(s: Pick<Session, 'rounds' | 'partial'>, perRound = 3): number {
  return s.rounds * perRound + s.partial;
}

export function roundsDecimal(s: Pick<Session, 'rounds' | 'partial' | 'exercises'>): number {
  return s.rounds + s.partial / (s.exercises.length || 3);
}

export function scoreLabel(s: Pick<Session, 'rounds' | 'partial'>): string {
  return `${s.rounds}+${s.partial}`;
}

export function repsFor(s: Pick<Session, 'rounds' | 'partial' | 'exercises'>, index: number): number {
  const sets = s.rounds + (index < s.partial ? 1 : 0);
  return sets * s.exercises[index].reps;
}

export function totalReps(s: Pick<Session, 'rounds' | 'partial' | 'exercises'>): number {
  return s.exercises.reduce((sum, _, i) => sum + repsFor(s, i), 0);
}

export function fmtClock(sec: number): string {
  const t = Math.max(0, Math.round(sec));
  const m = Math.floor(t / 60), x = t % 60;
  return `${String(m).padStart(2, '0')}:${String(x).padStart(2, '0')}`;
}

/** Average time per full round, "m:ss". */
export function pacePerRound(s: Pick<Session, 'rounds' | 'partial' | 'exercises' | 'durationSec'>): string {
  const r = roundsDecimal(s);
  if (r <= 0) return '—';
  const t = Math.round(s.durationSec / r);
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
}

function sameCircuit(a: Session, b: Pick<Session, 'exercises'>): boolean {
  const ids = (s: Pick<Session, 'exercises'>) => s.exercises.map((e) => e.exerciseId).sort().join('|');
  return ids(a) === ids(b);
}

/** Previous session to compare with: the last one with the same 3 exercises, else simply the last one. */
export function comparisonSession(history: Session[], current: Pick<Session, 'exercises'>): { session: Session; same: boolean } | null {
  const sorted = history.filter((s) => !s.deletedAt).sort((a, b) => b.createdAt - a.createdAt);
  const same = sorted.find((s) => sameCircuit(s, current));
  if (same) return { session: same, same: true };
  return sorted[0] ? { session: sorted[0], same: false } : null;
}

/** Compact delta for a small tile: "+1 rd", "-2 ex", "+1.3", "=" */
export function fmtUnitsDelta(d: number): string {
  if (d === 0) return '=';
  const sign = d > 0 ? '+' : '-';
  const a = Math.abs(d);
  if (a % 3 === 0) return `${sign}${a / 3} rd`;
  if (a < 3) return `${sign}${a} ex`;
  return `${sign}${(a / 3).toFixed(1)}`;
}

function weekIndex(ts: number): number {
  // Weeks start Monday (Unix epoch was a Thursday → shift by 3 days).
  return Math.floor((ts + 3 * DAY_MS - new Date(ts).getTimezoneOffset() * 60_000) / WEEK_MS);
}

/** Consecutive weeks with at least one session, ending this week (or last week if none yet this week). */
export function weekStreak(sessions: Session[], now = Date.now()): number {
  const weeks = new Set(sessions.filter((s) => !s.deletedAt).map((s) => weekIndex(s.createdAt)));
  let w = weekIndex(now);
  if (!weeks.has(w)) w -= 1;
  let n = 0;
  while (weeks.has(w)) { n++; w--; }
  return n;
}

export function inRange(sessions: Session[], days: number | null, now = Date.now()): Session[] {
  return sessions
    .filter((s) => !s.deletedAt && (days === null || now - s.createdAt <= days * DAY_MS))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export interface Summary {
  count: number;
  best: Session | null;
  avgRounds: number;
}

export function summarize(sessions: Session[]): Summary {
  const live = sessions.filter((s) => !s.deletedAt);
  const best = live.reduce<Session | null>((b, s) => (!b || roundsDecimal(s) > roundsDecimal(b) ? s : b), null);
  const avgRounds = live.length ? live.reduce((a, s) => a + roundsDecimal(s), 0) / live.length : 0;
  return { count: live.length, best, avgRounds };
}

export function mostUsed(sessions: Session[], n = 4): { name: string; count: number }[] {
  const counts = new Map<string, { name: string; count: number }>();
  for (const s of sessions) {
    for (const e of s.exercises) {
      const c = counts.get(e.exerciseId) ?? { name: e.name, count: 0 };
      c.count++;
      counts.set(e.exerciseId, c);
    }
  }
  return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, n);
}
