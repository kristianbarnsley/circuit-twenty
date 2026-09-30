import { useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { MinusIcon, PlusIcon } from '../components/icons';
import { Box, Header, Prompt } from '../components/ui';
import { sessionRepo, useSessions } from '../db/repo';
import { WORKOUT_SECONDS, type Session } from '../domain/types';
import {
  comparisonSession, fmtClock, fmtUnitsDelta, pacePerRound, repsFor, totalReps, units,
} from '../engine/stats';
import { useApp } from '../state/store';
import { elapsedMs } from '../engine/timer';
import { loadLabel, uuid } from './shared';

const EFFORTS = ['EASY', 'OK', 'HARD', 'V.HARD', 'MAX'];

export default function Submit() {
  const nav = useNavigate();
  const run = useApp((s) => s.run);
  const setRun = useApp((s) => s.setRun);
  const setDraft = useApp((s) => s.setDraft);
  const sessions = useSessions();
  const [effort, setEffort] = useState(2);
  const [notes, setNotes] = useState('');
  // Allow fixing the count if a tap was missed during the workout.
  const [rounds, setRounds] = useState(run?.rounds ?? 0);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [saving, setSaving] = useState(false);
  // Set while leaving, so clearing the run doesn't trigger the no-run redirect below.
  const leaving = useRef(false);

  if (!run) return leaving.current ? null : <Navigate to="/" replace />;
  if (!run.endedAt) return <Navigate to="/run" replace />;

  const n = run.exercises.length;
  const durationSec = Math.min(WORKOUT_SECONDS, Math.round(elapsedMs(run, run.endedAt) / 1000));
  const partial = run.done.filter(Boolean).length;
  const draft: Session = {
    id: '', createdAt: run.startedAt, updatedAt: 0, equipment: run.equipment, seed: run.seed,
    exercises: run.exercises, durationSec, rounds, partial, effort, notes,
  };
  const cmp = sessions ? comparisonSession(sessions, draft) : null;
  const delta = cmp ? units(draft, n) - units(cmp.session, cmp.session.exercises.length) : null;

  const save = async () => {
    setSaving(true);
    const now = Date.now();
    await sessionRepo.add({ ...draft, id: uuid(), createdAt: run.endedAt ?? now, updatedAt: now, notes: notes.trim() });
    leaving.current = true;
    nav('/history', { replace: true });
    setRun(null);
    setDraft(null);
  };
  const discard = () => {
    leaving.current = true;
    nav('/', { replace: true });
    setRun(null);
    setDraft(null);
  };

  return (
    <>
      <Header />
      <main className="main bottom-pad" style={{ gap: 22 }}>
        <div className="stack g6">
          <Prompt cmd="session --complete" />
          <div className="prompt hi">
            [ok] {fmtClock(durationSec)} elapsed · {durationSec >= WORKOUT_SECONDS ? 'timer stopped' : 'ended early'}
          </div>
        </div>

        <div className="big-score">
          <span className="n">{rounds}</span>
          <div className="stack g6" style={{ paddingBottom: 6, flexGrow: 1 }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-strong)' }}>
              rounds <span className="muted">+{partial}</span>
            </span>
            <span className="small muted">{rounds} full circuits, {partial} ex into round {rounds + 1}</span>
          </div>
          <div className="stack g6">
            <button type="button" className="icon-btn" aria-label="Add a round" onClick={() => setRounds(rounds + 1)}><PlusIcon size={16} w={2.5} /></button>
            <button type="button" className="icon-btn" aria-label="Remove a round" onClick={() => setRounds(Math.max(0, rounds - 1))}><MinusIcon /></button>
          </div>
        </div>

        <div className="grid3">
          <div className="tile"><span className="k">TOTAL REPS</span><span className="v">{totalReps(draft)}</span></div>
          <div className="tile"><span className="k">PACE/RND</span><span className="v">{pacePerRound(draft)}</span></div>
          <div className={`tile ${delta !== null && delta > 0 ? 'hot' : ''}`}>
            <span className="k">{cmp?.same ? 'VS SAME' : 'VS LAST'}</span>
            <span className="v">{delta === null ? '—' : fmtUnitsDelta(delta)}</span>
          </div>
        </div>

        <Box label="breakdown" style={{ gap: 0, paddingBottom: 10 }}>
          {run.exercises.map((e, i) => (
            <div className="row" key={e.exerciseId}>
              <span className="stack" style={{ gap: 2 }}>
                <span style={{ color: 'var(--text-strong)' }}>{e.name}</span>
                <span className="small muted">{loadLabel(e)}</span>
              </span>
              <span className="muted">
                {rounds + (i < partial ? 1 : 0)} × {e.reps} = <b className="hi">{repsFor(draft, i)}</b>
              </span>
            </div>
          ))}
        </Box>

        <fieldset style={{ margin: 0, padding: 0, border: 0 }} className="stack g8">
          <legend className="small muted" style={{ padding: 0, marginBottom: 8 }}>effort.rating</legend>
          <div className="grid5">
            {EFFORTS.map((l, i) => (
              <button key={l} type="button" aria-pressed={effort === i} className={`effort ${effort === i ? 'on' : ''}`} onClick={() => setEffort(i)}>
                {l}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="stack g8">
          <label htmlFor="notes" className="small muted">notes.md</label>
          <textarea
            id="notes"
            className="notes"
            placeholder="> how did it feel? weights used, form cues, what to change…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="spacer" />

        <div className="stack g6">
          <button type="button" className="cta" onClick={save} disabled={saving}>
            <span>SAVE SESSION</span><span style={{ fontSize: 18 }}>↵</span>
          </button>
          {confirmDiscard ? (
            <div className="confirm">
              <span>discard this session? it won't be logged.</span>
              <div className="grid2">
                <button type="button" className="btn" onClick={() => setConfirmDiscard(false)}>KEEP</button>
                <button type="button" className="btn fill warn" onClick={discard}>DISCARD</button>
              </div>
            </div>
          ) : (
            <button type="button" className="link-btn" onClick={() => setConfirmDiscard(true)}>discard session</button>
          )}
        </div>
      </main>
    </>
  );
}
