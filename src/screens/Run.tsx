import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { MinusIcon, PlusIcon, StopIcon } from '../components/icons';
import { Box, Header } from '../components/ui';
import { EXERCISE_BY_ID, equipmentTag } from '../data/exercises';
import { WORKOUT_SECONDS } from '../domain/types';
import { fmtClock } from '../engine/stats';
import { remainingSec } from '../engine/timer';
import { cue, unlockAudio } from '../lib/beep';
import { useWakeLock } from '../lib/wakeLock';
import { useApp } from '../state/store';
import { loadLabel } from './shared';

const CUES = [
  { id: 'half', at: 600, beeps: 2, final: false },
  { id: 'min', at: 60, beeps: 3, final: false },
  { id: 'end', at: 0, beeps: 3, final: true },
];
/** Don't replay a cue that was missed while the app was in the background for longer than this. */
const CUE_GRACE_SEC = 3;

export default function Run() {
  const nav = useNavigate();
  const run = useApp((s) => s.run);
  const updateRun = useApp((s) => s.updateRun);
  const [now, setNow] = useState(Date.now());
  const [confirmEnd, setConfirmEnd] = useState(false);

  // Clock is derived from timestamps, so it stays right across app switches and reloads.
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const t = setInterval(tick, 250);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(t);
      document.removeEventListener('visibilitychange', tick);
    };
  }, []);

  const remaining = run ? remainingSec(run, now) : 0;
  const paused = !!run?.pausedAt;
  const timeUp = remaining === 0;

  useWakeLock(!!run && !run.endedAt);

  useEffect(() => {
    if (!run || run.endedAt) return;
    const due = CUES.filter((c) => !run.cuesFired.includes(c.id) && remaining <= c.at);
    if (!due.length) return;
    const latest = due[due.length - 1];
    if (remaining >= latest.at - CUE_GRACE_SEC) cue(latest.beeps, latest.final);
    updateRun((r) => ({ ...r, cuesFired: [...r.cuesFired, ...due.map((c) => c.id)] }));
  }, [run, remaining, updateRun]);

  if (!run) return <Navigate to="/" replace />;
  if (run.endedAt) return <Navigate to="/submit" replace />;

  const elapsedSec = WORKOUT_SECONDS - remaining;
  const filled = Math.floor(elapsedSec / 60);
  const cur = run.done.indexOf(false);
  const partial = run.done.filter(Boolean).length;
  const n = run.exercises.length;

  const tap = (i: number) =>
    updateRun((r) => {
      const done = r.done.map((d, j) => (j === i ? !d : d));
      return done.every(Boolean) ? { ...r, rounds: r.rounds + 1, done: done.map(() => false) } : { ...r, done };
    });
  const inc = () => updateRun((r) => ({ ...r, rounds: r.rounds + 1, done: r.done.map(() => false) }));
  const dec = () => updateRun((r) => ({ ...r, rounds: Math.max(0, r.rounds - 1) }));
  const togglePause = () => {
    unlockAudio();
    updateRun((r) =>
      r.pausedAt
        ? { ...r, pausedAt: null, pausedMs: r.pausedMs + (Date.now() - r.pausedAt) }
        : { ...r, pausedAt: Date.now() },
    );
  };
  const end = () => {
    updateRun((r) => ({ ...r, endedAt: r.pausedAt ?? Math.min(Date.now(), r.startedAt + r.pausedMs + WORKOUT_SECONDS * 1000) }));
    nav('/submit', { replace: true });
  };

  const status = timeUp ? 'TIME' : paused ? 'PAUSED' : 'LIVE';
  const statusColor = timeUp || paused ? 'var(--amber)' : 'var(--primary)';

  return (
    <>
      <Header>
        <div className="status-pill" style={{ color: statusColor }}><i />{status}</div>
      </Header>
      <main className="main bottom-pad" style={{ gap: 20, paddingTop: 20 }}>
        <section aria-label="Timer" className="stack g10">
          <div className="prompt" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
            <span>time.remaining</span><span>elapsed {fmtClock(elapsedSec)}</span>
          </div>
          <div className={`clock ${timeUp || paused ? 'warn' : ''}`} role="timer">{fmtClock(remaining)}</div>
          <div className="segs" aria-hidden="true">
            {Array.from({ length: 20 }, (_, i) => <span key={i} className={i < filled ? 'on' : ''} />)}
          </div>
        </section>

        <Box label="rounds.completed" className="rounds">
          <button type="button" className="icon-btn big" aria-label="Remove one round" onClick={dec}><MinusIcon size={22} /></button>
          <div className="rounds-val">
            <b>{String(run.rounds).padStart(2, '0')}</b>
            <span className="small muted">+{partial}/{n} in round {run.rounds + 1}</span>
          </div>
          <button type="button" className="icon-btn big fill" aria-label="Add one round" onClick={inc}><PlusIcon size={22} w={2.5} /></button>
        </Box>

        <section aria-label="Exercises" className="stack g8">
          <div className="small muted">circuit · tap when done</div>
          {run.exercises.map((e, i) => {
            const done = run.done[i], isNow = i === cur;
            const ex = EXERCISE_BY_ID[e.exerciseId];
            const tag = [ex && equipmentTag(ex), e.kg !== undefined && loadLabel(e)].filter(Boolean).join(' · ');
            return (
              <button
                key={e.exerciseId}
                type="button"
                aria-pressed={done}
                className={`run-ex ${done ? 'done' : ''} ${isNow ? 'now' : ''}`}
                onClick={() => tap(i)}
              >
                <span className="mark">{done ? '[x]' : isNow ? '[>]' : '[ ]'}</span>
                <span className="stack" style={{ gap: 2, flexGrow: 1 }}>
                  <span className="name">{e.name}</span>
                  <span className="tag">{isNow ? `> now · ${tag}` : tag}</span>
                </span>
                <span className="reps">×{e.reps}</span>
              </button>
            );
          })}
        </section>

        <div className="spacer" />

        {confirmEnd ? (
          <div className="confirm" role="alertdialog" aria-label="End workout early">
            <span>end session with {fmtClock(remaining)} left?</span>
            <div className="grid2">
              <button type="button" className="btn" onClick={() => setConfirmEnd(false)}>KEEP GOING</button>
              <button type="button" className="btn fill warn" onClick={end}>END NOW</button>
            </div>
          </div>
        ) : timeUp ? (
          <button type="button" className="cta" onClick={end}>
            <span>FINISH · LOG IT</span><span style={{ fontSize: 18 }}>↵</span>
          </button>
        ) : (
          <div className="grid2">
            <button type="button" className="btn tall" onClick={togglePause}>{paused ? 'RESUME' : 'PAUSE'}</button>
            <button type="button" className="btn tall warn" onClick={() => setConfirmEnd(true)}><StopIcon /> END</button>
          </div>
        )}
      </main>
    </>
  );
}
